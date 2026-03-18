import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import { config, SUPPORTED_LOCALES } from './config.js';
import { createRepository } from './db.js';
import { createMailer } from './mailer.js';

const app = express();
const repository = createRepository(config.dbFile);
const mailer = createMailer(config);
const supportedLocaleSet = new Set(SUPPORTED_LOCALES);
const REQUIRED_MANIFESTO_CHECKS = 9;

function writeLog(level, message, meta = {}) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });

  if (level === 'error') {
    console.error(entry);
    return;
  }

  if (level === 'warn') {
    console.warn(entry);
    return;
  }

  console.log(entry);
}

function logInfo(message, meta = {}) {
  writeLog('info', message, meta);
}

function logWarn(message, meta = {}) {
  writeLog('warn', message, meta);
}

function logError(message, meta = {}) {
  writeLog('error', message, meta);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: '256kb' }));
app.use((request, response, next) => {
  const startedAt = Date.now();
  const incomingRequestId = sanitizeText(request.headers['x-request-id']);
  const requestId = incomingRequestId || crypto.randomUUID();
  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  response.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const forwardedFor = sanitizeText(request.headers['x-forwarded-for']);
    const clientIp =
      forwardedFor.split(',')[0]?.trim() || request.socket.remoteAddress || '-';
    const userAgent = truncateForLog(sanitizeText(request.headers['user-agent']), 180);

    logInfo('HTTP request completed', {
      requestId,
      method: request.method,
      path: request.originalUrl,
      status: response.statusCode,
      durationMs,
      ip: clientIp,
      userAgent,
    });
  });

  next();
});

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildVerificationLink(token) {
  const url = new URL(config.appBaseUrl);
  url.searchParams.set('verify', token);
  return url.toString();
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function truncateForLog(value, maxLength = 220) {
  if (typeof value !== 'string') {
    return '';
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

function maskEmail(value) {
  const normalized = sanitizeText(value).toLowerCase();

  if (!normalized.includes('@')) {
    return '';
  }

  const [localPart, domainPart] = normalized.split('@');

  if (!domainPart) {
    return '';
  }

  const visibleLocal = localPart.slice(0, 2);
  const localMask = localPart.length > 2 ? '***' : '*';

  return `${visibleLocal}${localMask}@${domainPart}`;
}

function buildErrorMeta(error) {
  if (typeof error === 'string') {
    return {
      errorMessage: error,
    };
  }

  if (!error || typeof error !== 'object') {
    return {};
  }

  const meta = {
    errorName: truncateForLog(error.name, 120),
    errorMessage: truncateForLog(error.message, 500),
    errorCode:
      typeof error.code === 'string' || typeof error.code === 'number'
        ? String(error.code)
        : '',
    smtpCommand: truncateForLog(error.command, 120),
    smtpResponse: truncateForLog(error.response, 500),
    smtpResponseCode: Number.isFinite(error.responseCode) ? error.responseCode : undefined,
    stack: truncateForLog(error.stack, 5000),
  };

  if (error.details && typeof error.details === 'object') {
    meta.errorDetails = error.details;
  }

  return meta;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateDepartment(value) {
  return /^\d{2,3}$/.test(value);
}

function normalizeProfessionalWebsite(value) {
  const input = sanitizeText(value);

  if (!input) {
    return '';
  }

  try {
    const url = new URL(input);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return '';
    }

    return url.toString();
  } catch {
    return '';
  }
}

function createValidationError(details) {
  const error = new Error('Validation failed');
  error.code = 'VALIDATION_ERROR';
  error.status = 400;
  error.details = details;
  return error;
}

function getErrorStatus(error) {
  if (error.code === 'ALREADY_VERIFIED') {
    return 409;
  }

  if (error.code === 'INVALID_TOKEN') {
    return 404;
  }

  if (error.code === 'RESEND_UNAVAILABLE') {
    return 410;
  }

  return error.status ?? 500;
}

function parseRegistration(body) {
  const fullName = sanitizeText(body.fullName);
  const email = sanitizeText(body.email).toLowerCase();
  const profession = sanitizeText(body.profession);
  const department = sanitizeText(body.department);
  const locale = sanitizeText(body.locale).toLowerCase() || 'fr';
  const aiProfessionalAccepted = body.aiProfessionalAccepted === true;
  const professionalWebsiteRaw = sanitizeText(body.professionalWebsite);
  const professionalWebsite = normalizeProfessionalWebsite(professionalWebsiteRaw);
  const diffusionAccepted = body.diffusionAccepted === true;
  const privacyAccepted = body.privacyAccepted === true;
  const manifestoChecks = Array.isArray(body.manifestoChecks) ? body.manifestoChecks : [];
  const manifestoAccepted =
    manifestoChecks.length === REQUIRED_MANIFESTO_CHECKS &&
    manifestoChecks.every((value) => value === true);

  const details = {};

  if (fullName.length < 3) {
    details.fullName = 'REQUIRED';
  }

  if (!isValidEmail(email)) {
    details.email = 'INVALID';
  }

  if (profession.length < 2) {
    details.profession = 'REQUIRED';
  }

  if (!validateDepartment(department)) {
    details.department = 'INVALID';
  }

  if (aiProfessionalAccepted && professionalWebsiteRaw.length === 0) {
    details.professionalWebsite = 'REQUIRED';
  } else if (aiProfessionalAccepted && professionalWebsite.length === 0) {
    details.professionalWebsite = 'INVALID';
  }

  if (!diffusionAccepted) {
    details.diffusionAccepted = 'REQUIRED';
  }

  if (!privacyAccepted) {
    details.privacyAccepted = 'REQUIRED';
  }

  if (!manifestoAccepted) {
    details.manifestoChecks = 'ALL_REQUIRED';
  }

  if (!supportedLocaleSet.has(locale)) {
    details.locale = 'UNSUPPORTED';
  }

  if (Object.keys(details).length > 0) {
    throw createValidationError(details);
  }

  return {
    fullName,
    email,
    profession,
    department,
    locale,
    aiProfessionalConsent: Number(aiProfessionalAccepted),
    professionalWebsite: aiProfessionalAccepted ? professionalWebsite : '',
    diffusionConsent: Number(diffusionAccepted),
    privacyConsent: Number(privacyAccepted),
    charterConsent: Number(manifestoAccepted),
    verificationTokenHash: '',
  };
}

app.get('/api/health', (request, response) => {
  response.json({
    ok: true,
    privacyPolicyUrl: config.privacyPolicyUrl,
  });
});

app.get('/api/signers', (request, response) => {
  response.json(repository.getDirectory());
});

app.post('/api/signers/register', async (request, response, next) => {
  try {
    logInfo('Registration request received', {
      requestId: request.requestId ?? '-',
      email: maskEmail(request.body?.email),
      locale: sanitizeText(request.body?.locale).toLowerCase() || 'fr',
    });

    const payload = parseRegistration(request.body);
    const token = crypto.randomBytes(32).toString('hex');
    payload.verificationTokenHash = hashToken(token);

    const signer = repository.createOrRefreshPendingSigner(payload);
    const verifyUrl = buildVerificationLink(token);

    logInfo('Pending signer stored', {
      requestId: request.requestId ?? '-',
      email: maskEmail(payload.email),
      publicDisplayName: signer.publicDisplayName,
    });

    try {
      const delivery = await mailer.sendVerificationEmail({
        email: payload.email,
        fullName: payload.fullName,
        locale: payload.locale,
        verifyUrl,
      });

      logInfo('Verification email sent', {
        requestId: request.requestId ?? '-',
        email: maskEmail(payload.email),
        messageId: truncateForLog(delivery?.messageId, 180),
        smtpResponse: truncateForLog(delivery?.response, 220),
      });
    } catch (error) {
      logError('Verification email delivery failed', {
        requestId: request.requestId ?? '-',
        email: maskEmail(payload.email),
        ...buildErrorMeta(error),
      });

      const deliveryError = new Error(
        'Verification email could not be delivered right now. Please try again shortly.',
      );
      deliveryError.code = 'EMAIL_DELIVERY_FAILED';
      deliveryError.status = 503;
      throw deliveryError;
    }

    response.status(202).json({
      status: 'verification_sent',
      verificationCode: token,
      signer,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/signers/status', (request, response, next) => {
  try {
    const token = sanitizeText(request.query.token);

    if (!token) {
      throw createValidationError({ token: 'MISSING' });
    }

    const result = repository.getSignerStatusByTokenHash(hashToken(token));

    if (!result) {
      const error = new Error('Verification code is invalid or expired');
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    response.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/signers/resend', (request, response) => {
  response.status(410).json({
    code: 'RESEND_UNAVAILABLE',
    message:
      'Resending is unavailable because email addresses are not stored. Submit the signature form again to receive a new verification email.',
  });
});

app.get('/api/signers/verify', (request, response) => {
  const token = sanitizeText(request.query.token);

  if (!token) {
    logWarn('Verification attempt missing token', {
      requestId: request.requestId ?? '-',
    });

    response.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Token missing',
      requestId: request.requestId ?? '-',
    });
    return;
  }

  const tokenHash = hashToken(token);
  const signer = repository.verifyByTokenHash(tokenHash);

  if (!signer) {
    logWarn('Verification attempt with invalid or expired token', {
      requestId: request.requestId ?? '-',
    });

    response.status(404).json({
      code: 'INVALID_TOKEN',
      message: 'Verification link is invalid or expired',
      requestId: request.requestId ?? '-',
    });
    return;
  }

  const status = repository.getSignerStatusByTokenHash(tokenHash);

  response.json({
    status: 'verified',
    signer: status?.signer ?? signer,
  });
});

app.use((error, request, response, next) => {
  const status = getErrorStatus(error);
  const requestId = request.requestId ?? '-';

  if (status >= 400 && status < 500) {
    logWarn('Request rejected', {
      requestId,
      method: request.method,
      path: request.originalUrl,
      status,
      ...buildErrorMeta(error),
    });
  } else if (status >= 500) {
    logError('Request failed', {
      requestId,
      method: request.method,
      path: request.originalUrl,
      status,
      ...buildErrorMeta(error),
    });
  }

  response.status(status).json({
    code: error.code ?? 'INTERNAL_ERROR',
    message: error.message ?? 'Unexpected error',
    details: error.details ?? {},
    requestId,
  });
});

logInfo('Server starting', {
  nodeEnv: config.nodeEnv,
  port: config.port,
  appBaseUrl: config.appBaseUrl,
  dbFile: config.dbFile,
  smtpHost: config.smtpHost,
  smtpPort: config.smtpPort,
  smtpSecure: config.smtpSecure,
  smtpRequireAuth: config.smtpRequireAuth,
  smtpHasUser: Boolean(config.smtpUser),
  smtpVerifyOnStartup: config.smtpVerifyOnStartup,
});

if (config.smtpVerifyOnStartup) {
  mailer
    .verifyConnection()
    .then(() => {
      logInfo('SMTP connectivity probe succeeded', {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
      });
    })
    .catch((error) => {
      logError('SMTP connectivity probe failed', {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        ...buildErrorMeta(error),
      });
    });
}

app.listen(config.port, () => {
  logInfo('Manifesto API listening', {
    url: `http://localhost:${config.port}`,
  });
});
