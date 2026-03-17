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

  if (error.code === 'NOT_FOUND') {
    return 404;
  }

  return error.status ?? 500;
}

function parseRegistration(body) {
  const fullName = sanitizeText(body.fullName);
  const email = sanitizeText(body.email).toLowerCase();
  const profession = sanitizeText(body.profession);
  const department = sanitizeText(body.department);
  const locale = sanitizeText(body.locale).toLowerCase() || 'fr';
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
      verifyUrl,
    });

    response.status(202).json({
      status: 'verification_sent',
      signer,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/signers/resend', async (request, response, next) => {
  try {
    const email = sanitizeText(request.body.email).toLowerCase();

    if (!isValidEmail(email)) {
      throw createValidationError({ email: 'INVALID' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const result = repository.resendToken(email, tokenHash);

    if (result.status === 'already_verified') {
      response.json(result);
      return;
    }

    const verifyUrl = buildVerificationLink(token);

    await mailer.sendVerificationEmail({
      email,
      fullName: result.signer.full_name,
      verifyUrl,
    });

    response.json({ status: 'verification_sent' });
  } catch (error) {
    next(error);
  }
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

  const signer = repository.verifyByTokenHash(hashToken(token));

  if (!signer) {
    response.status(404).json({
      code: 'INVALID_TOKEN',
      message: 'Verification link is invalid or expired',
    });
    return;
  }

  response.json({
    status: 'verified',
    signer,
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
