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

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: '256kb' }));

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
    const payload = parseRegistration(request.body);
    const token = crypto.randomBytes(32).toString('hex');
    payload.verificationTokenHash = hashToken(token);

    const signer = repository.createOrRefreshPendingSigner(payload);
    const verifyUrl = buildVerificationLink(token);

    await mailer.sendVerificationEmail({
      email: payload.email,
      fullName: payload.fullName,
      locale: payload.locale,
      verifyUrl,
    });

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
    response.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Token missing',
    });
    return;
  }

  const tokenHash = hashToken(token);
  const signer = repository.verifyByTokenHash(tokenHash);

  if (!signer) {
    response.status(404).json({
      code: 'INVALID_TOKEN',
      message: 'Verification link is invalid or expired',
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

  response.status(status).json({
    code: error.code ?? 'INTERNAL_ERROR',
    message: error.message ?? 'Unexpected error',
    details: error.details ?? {},
  });
});

app.listen(config.port, () => {
  console.log(`Manifesto API listening on http://localhost:${config.port}`);
});
