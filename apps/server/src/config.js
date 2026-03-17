import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

function parseBoolean(value, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
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
  port: Number(process.env.PORT ?? 3001),
  dbFile:
    process.env.DB_FILE ??
    path.resolve(currentDir, '../../../data/manifesto.sqlite'),
  appBaseUrl: process.env.APP_BASE_URL ?? 'http://localhost:5173',
  privacyPolicyUrl:
    process.env.PRIVACY_POLICY_URL ??
    'https://p2enjoy.studio/privacy/politique-confidentialite',
  smtpHost: process.env.SMTP_HOST ?? 'localhost',
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
  smtpSecure: parseBoolean(
    process.env.SMTP_SECURE,
    Number(process.env.SMTP_PORT ?? 1025) === 465 ||
      Number(process.env.SMTP_PORT ?? 1025) === 2465,
  ),
  smtpRequireAuth: parseBoolean(
    process.env.SMTP_REQUIRE_AUTH,
    (process.env.NODE_ENV ?? 'development') === 'production',
  ),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? 'Manifesto IA <noreply@manifesto.local>',
};
