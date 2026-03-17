import nodemailer from 'nodemailer';

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
    auth: config.smtpUser
      ? {
          user: config.smtpUser,
          pass: config.smtpPass,
        }
      : undefined,
  });

  return {
    async sendVerificationEmail({ email, fullName, verifyUrl }) {
      const text = [
        `Bonjour ${fullName},`,
        '',
        "Merci pour votre engagement.",
        "Pour publier votre signature sur le manifeste, confirmez votre adresse email via ce lien :",
        verifyUrl,
        '',
        "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.",
      ].join('\n');

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a;">
          <p>Bonjour ${fullName},</p>
          <p>Merci pour votre engagement.</p>
          <p>Pour publier votre signature sur le manifeste, confirmez votre adresse email via le lien ci-dessous :</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message.</p>
        </div>
      `;

      await transporter.sendMail({
        from: config.smtpFrom,
        to: email,
        subject: 'Confirmez votre signature du manifeste IA',
        text,
        html,
      });
    },
  };
}
