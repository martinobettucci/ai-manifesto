import crypto from 'node:crypto';
import { isIP } from 'node:net';
import express from 'express';
import helmet from 'helmet';
import { config, SUPPORTED_LOCALES } from './config.js';
import { normalizeCountryCode } from './countries.js';
import { createRepository } from './db.js';
import { createMailer } from './mailer.js';

const app = express();
const repository = createRepository(config.dbFile);
const mailer = createMailer(config);
const supportedLocaleSet = new Set(SUPPORTED_LOCALES);
const REQUIRED_MANIFESTO_CHECKS = 9;
const GEOLOOKUP_TIMEOUT_MS = 1800;
const GEOLOOKUP_HEADERS = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'cloudfront-viewer-country',
  'fastly-country-code',
  'x-country-code',
  'x-appengine-country',
];

function writeLog(level, message, meta = {}) {
  const safeMeta = redactSensitiveMeta(meta);
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...safeMeta,
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
      path: sanitizePathForLog(request.originalUrl),
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

function readHeaderText(request, headerName) {
  const value = request.headers[headerName];

  if (Array.isArray(value)) {
    return sanitizeText(value[0] ?? '');
  }

  return sanitizeText(value);
}

function normalizeIpAddress(value) {
  const input = sanitizeText(value);

  if (!input) {
    return '';
  }

  const bracketedIpv6 = input.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketedIpv6) {
    return bracketedIpv6[1];
  }

  const ipv4WithPort = input.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort) {
    return ipv4WithPort[1];
  }

  if (input.startsWith('::ffff:')) {
    const mappedIpv4 = input.slice('::ffff:'.length);
    if (isIP(mappedIpv4) === 4) {
      return mappedIpv4;
    }
  }

  return input;
}

function resolveClientIp(request) {
  const forwardedFor = readHeaderText(request, 'x-forwarded-for');
  const realIp = readHeaderText(request, 'x-real-ip');
  const candidate = forwardedFor.split(',')[0]?.trim() || realIp || request.socket.remoteAddress;
  return normalizeIpAddress(candidate);
}

function isPrivateIpv4(ipAddress) {
  const octets = ipAddress.split('.').map((part) => Number.parseInt(part, 10));
  const [first, second] = octets;

  if (first === 10 || first === 127 || first === 0) {
    return true;
  }

  if (first === 169 && second === 254) {
    return true;
  }

  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }

  if (first === 192 && second === 168) {
    return true;
  }

  if (first === 100 && second >= 64 && second <= 127) {
    return true;
  }

  if (first >= 224) {
    return true;
  }

  return false;
}

function isPrivateIpv6(ipAddress) {
  const normalized = ipAddress.toLowerCase();

  if (normalized === '::1' || normalized === '::') {
    return true;
  }

  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }

  if (normalized.startsWith('fe80')) {
    return true;
  }

  if (normalized.startsWith('2001:db8')) {
    return true;
  }

  return false;
}

function isPublicIpAddress(ipAddress) {
  const version = isIP(ipAddress);

  if (version === 4) {
    return !isPrivateIpv4(ipAddress);
  }

  if (version === 6) {
    return !isPrivateIpv6(ipAddress);
  }

  return false;
}

function resolveCountryFromHeaders(request) {
  for (const headerName of GEOLOOKUP_HEADERS) {
    const countryCode = normalizeCountryCode(readHeaderText(request, headerName));
    if (countryCode) {
      return {
        countryCode,
        source: `header:${headerName}`,
      };
    }
  }

  return null;
}

function resolveCountryFromAcceptLanguage(request) {
  const header = readHeaderText(request, 'accept-language');

  if (!header) {
    return '';
  }

  const tags = header
    .split(',')
    .map((entry) => entry.split(';')[0]?.trim())
    .filter(Boolean);

  for (const tag of tags) {
    const parts = tag.split('-').map((part) => part.trim());

    for (const part of parts.slice(1)) {
      if (!/^[A-Za-z]{2}$/.test(part)) {
        continue;
      }

      const countryCode = normalizeCountryCode(part);
      if (countryCode) {
        return countryCode;
      }
    }
  }

  return '';
}

async function lookupCountryCodeByIp(ipAddress) {
  if (!isPublicIpAddress(ipAddress)) {
    return '';
  }

  const lookupUrl = new URL(`https://ipwho.is/${ipAddress}`);
  lookupUrl.searchParams.set('fields', 'success,country_code');

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, GEOLOOKUP_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(lookupUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!upstreamResponse.ok) {
      return '';
    }

    const payload = await upstreamResponse.json().catch(() => null);
    if (!payload || payload.success !== true) {
      return '';
    }

    return normalizeCountryCode(payload.country_code);
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
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

function sanitizePathForLog(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return '/';
  }

  try {
    const url = new URL(value, 'http://localhost');
    const sensitiveKeys = [];

    for (const key of url.searchParams.keys()) {
      const normalized = key.trim().toLowerCase();

      if (normalized.includes('token') || normalized.includes('verify')) {
        sensitiveKeys.push(key);
      }
    }

    for (const key of sensitiveKeys) {
      url.searchParams.delete(key);
    }

    const safeQuery = url.searchParams.toString();
    return safeQuery ? `${url.pathname}?${safeQuery}` : url.pathname;
  } catch {
    return value
      .replace(/([?&])(token|verify)[^=]*=[^&]*/gi, '$1$2=[REDACTED]')
      .replace(/[?&]$/, '');
  }
}

function redactSensitiveText(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  return value
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/([?&])(token|verify)[^=]*=[^&]*/gi, '$1$2=[REDACTED]');
}

function redactSensitiveMeta(value) {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveMeta(item));
  }

  if (value && typeof value === 'object') {
    const next = {};

    for (const [key, item] of Object.entries(value)) {
      const normalized = key.trim().toLowerCase();

      if (normalized.includes('email') || normalized === 'fullname' || normalized === 'full_name') {
        next[key] = '[REDACTED]';
        continue;
      }

      next[key] = redactSensitiveMeta(item);
    }

    return next;
  }

  if (typeof value === 'string') {
    return redactSensitiveText(value);
  }

  return value;
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
  const countryRaw = sanitizeText(
    body.country ?? body.nation ?? body.countryCode ?? body.nationCode,
  );
  const country = normalizeCountryCode(countryRaw);
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

  if (countryRaw && !country) {
    details.country = 'INVALID';
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
    country,
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

app.get('/api/visitor/country', async (request, response) => {
  const fromHeader = resolveCountryFromHeaders(request);

  if (fromHeader) {
    response.json(fromHeader);
    return;
  }

  const clientIp = resolveClientIp(request);
  const fromIpLookup = clientIp ? await lookupCountryCodeByIp(clientIp) : '';

  if (fromIpLookup) {
    response.json({
      countryCode: fromIpLookup,
      source: 'ipwho.is',
    });
    return;
  }

  const fromAcceptLanguage = resolveCountryFromAcceptLanguage(request);

  if (fromAcceptLanguage) {
    response.json({
      countryCode: fromAcceptLanguage,
      source: 'accept-language',
    });
    return;
  }

  response.json({
    countryCode: '',
    source: 'none',
  });
});

app.get('/api/signers', (request, response) => {
  response.json(repository.getDirectory());
});

app.post('/api/signers/register', async (request, response, next) => {
  try {
    logInfo('Registration request received', {
      requestId: request.requestId ?? '-',
      locale: sanitizeText(request.body?.locale).toLowerCase() || 'fr',
    });

    const payload = parseRegistration(request.body);
    const token = crypto.randomBytes(32).toString('hex');
    payload.verificationTokenHash = hashToken(token);

    const signer = repository.createOrRefreshPendingSigner(payload);
    const verifyUrl = buildVerificationLink(token);

    logInfo('Pending signer stored', {
      requestId: request.requestId ?? '-',
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
        messageId: truncateForLog(delivery?.messageId, 180),
        smtpResponse: truncateForLog(delivery?.response, 220),
      });
    } catch (error) {
      logError('Verification email delivery failed', {
        requestId: request.requestId ?? '-',
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
      path: sanitizePathForLog(request.originalUrl),
      status,
      ...buildErrorMeta(error),
    });
  } else if (status >= 500) {
    logError('Request failed', {
      requestId,
      method: request.method,
      path: sanitizePathForLog(request.originalUrl),
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
