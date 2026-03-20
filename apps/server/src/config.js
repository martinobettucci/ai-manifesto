import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseEmail(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
}

export const SUPPORTED_LOCALES = [
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'et',
  'fi',
  'fr',
  'ga',
  'hr',
  'hu',
  'it',
  'lt',
  'lv',
  'mt',
  'nl',
  'pl',
  'pt',
  'ro',
  'sk',
  'sl',
  'sv',
];

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePositiveInteger(process.env.PORT, 3001),
  dbFile:
    process.env.DB_FILE ??
    path.resolve(currentDir, '../../../data/manifesto.sqlite'),
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:5173',
  privacyPolicyUrl:
    process.env.PRIVACY_POLICY_URL ??
    'https://p2enjoy.studio/privacy/politique-confidentialite',
  smtpHost: process.env.SMTP_HOST ?? 'localhost',
  smtpPort: parsePositiveInteger(process.env.SMTP_PORT, 1025),
  smtpSecure: parseBoolean(
    process.env.SMTP_SECURE,
    parsePositiveInteger(process.env.SMTP_PORT, 1025) === 465 ||
      parsePositiveInteger(process.env.SMTP_PORT, 1025) === 2465,
  ),
  smtpRequireAuth: parseBoolean(
    process.env.SMTP_REQUIRE_AUTH,
    (process.env.NODE_ENV ?? 'development') === 'production',
  ),
  smtpConnectionTimeoutMs: parsePositiveInteger(
    process.env.SMTP_CONNECTION_TIMEOUT_MS,
    15000,
  ),
  smtpGreetingTimeoutMs: parsePositiveInteger(process.env.SMTP_GREETING_TIMEOUT_MS, 15000),
  smtpSocketTimeoutMs: parsePositiveInteger(process.env.SMTP_SOCKET_TIMEOUT_MS, 20000),
  smtpDnsTimeoutMs: parsePositiveInteger(process.env.SMTP_DNS_TIMEOUT_MS, 10000),
  smtpVerifyOnStartup: parseBoolean(
    process.env.SMTP_VERIFY_ON_STARTUP,
    (process.env.NODE_ENV ?? 'development') === 'production',
  ),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'Manifesto IA <noreply@manifesto.local>',
  adminEmail: parseEmail(process.env.ADMIN_EMAIL),
  adminMagicLinkTtlMinutes: parsePositiveInteger(process.env.ADMIN_MAGIC_LINK_TTL_MINUTES, 15),
  adminSessionTtlHours: parsePositiveInteger(process.env.ADMIN_SESSION_TTL_HOURS, 24),
  adminCookieName: process.env.ADMIN_COOKIE_NAME?.trim() || 'manifesto_admin_session',
};
