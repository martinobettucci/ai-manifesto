import nodemailer from 'nodemailer';
import { buildVerificationEmail } from './emailLocales.js';

export function createMailer(config) {
  if (config.smtpRequireAuth && (!config.smtpUser || !config.smtpPass)) {
    throw new Error(
      'SMTP auth is required for signer verification emails but SMTP_USER/SMTP_PASS are missing.',
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    connectionTimeout: config.smtpConnectionTimeoutMs,
    greetingTimeout: config.smtpGreetingTimeoutMs,
    socketTimeout: config.smtpSocketTimeoutMs,
    dnsTimeout: config.smtpDnsTimeoutMs,
    auth: config.smtpUser
      ? {
          user: config.smtpUser,
          pass: config.smtpPass,
        }
      : undefined,
  });

  return {
    async verifyConnection() {
      await transporter.verify();
    },

    async sendVerificationEmail({ email, fullName, locale, verifyUrl }) {
      const { subject, text, html } = buildVerificationEmail({
        locale,
        fullName,
        verifyUrl,
      });

      return transporter.sendMail({
        from: config.smtpFrom,
        to: email,
        subject,
        text,
        html,
      });
    },
  };
}
