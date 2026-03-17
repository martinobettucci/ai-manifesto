import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { createPublicDisplayName } from './mask.js';

export function createRepository(dbFile) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

  const db = new Database(dbFile);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS signers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      profession TEXT NOT NULL,
      department TEXT NOT NULL,
      locale TEXT NOT NULL,
      public_display_name TEXT NOT NULL,
      diffusion_consent INTEGER NOT NULL,
      privacy_consent INTEGER NOT NULL,
      charter_consent INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      verification_token_hash TEXT,
      verification_sent_at TEXT,
      verified_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_signers_status ON signers(status);
    CREATE INDEX IF NOT EXISTS idx_signers_verified_at ON signers(verified_at DESC);
  `);

  const selectDirectory = db.prepare(`
    SELECT
      id,
      public_display_name AS publicDisplayName,
      profession,
      department,
      verified_at AS verifiedAt
    FROM signers
    WHERE status = 'verified'
    ORDER BY datetime(verified_at) DESC
  `);

  const countVerified = db.prepare(`
    SELECT COUNT(*) AS total
    FROM signers
    WHERE status = 'verified'
  `);

  const selectByEmail = db.prepare(`
    SELECT *
    FROM signers
    WHERE email = ?
  `);

  const selectByToken = db.prepare(`
    SELECT *
    FROM signers
    WHERE verification_token_hash = ?
      AND status = 'pending'
  `);

  const insertSigner = db.prepare(`
    INSERT INTO signers (
      full_name,
      email,
      profession,
      department,
      locale,
      public_display_name,
      diffusion_consent,
      privacy_consent,
      charter_consent,
      status,
      verification_token_hash,
      verification_sent_at,
      created_at,
      updated_at
    ) VALUES (
      @fullName,
      @email,
      @profession,
      @department,
      @locale,
      @publicDisplayName,
      @diffusionConsent,
      @privacyConsent,
      @charterConsent,
      'pending',
      @verificationTokenHash,
      @verificationSentAt,
      @createdAt,
      @updatedAt
    )
  `);

  const updatePendingSigner = db.prepare(`
    UPDATE signers
    SET
      full_name = @fullName,
      profession = @profession,
      department = @department,
      locale = @locale,
      public_display_name = @publicDisplayName,
      diffusion_consent = @diffusionConsent,
      privacy_consent = @privacyConsent,
      charter_consent = @charterConsent,
      verification_token_hash = @verificationTokenHash,
      verification_sent_at = @verificationSentAt,
      updated_at = @updatedAt
    WHERE email = @email
  `);

  const updateTokenForEmail = db.prepare(`
    UPDATE signers
    SET
      verification_token_hash = ?,
      verification_sent_at = ?,
      updated_at = ?
    WHERE email = ?
      AND status = 'pending'
  `);

  const verifySigner = db.prepare(`
    UPDATE signers
    SET
      status = 'verified',
      verification_token_hash = NULL,
      verified_at = ?,
      updated_at = ?
    WHERE id = ?
  `);

  return {
    getDirectory() {
      return {
        total: countVerified.get().total,
        signers: selectDirectory.all(),
      };
    },

    createOrRefreshPendingSigner(payload) {
      const now = new Date().toISOString();
      const existing = selectByEmail.get(payload.email);
      const nextRecord = {
        ...payload,
        publicDisplayName: createPublicDisplayName(payload),
        verificationSentAt: now,
        createdAt: existing?.created_at ?? now,
        updatedAt: now,
      };

      if (existing?.status === 'verified') {
        const error = new Error('Already verified');
        error.code = 'ALREADY_VERIFIED';
        throw error;
      }

      if (existing) {
        updatePendingSigner.run(nextRecord);
      } else {
        insertSigner.run(nextRecord);
      }

      return {
        email: payload.email,
        publicDisplayName: nextRecord.publicDisplayName,
      };
    },

    resendToken(email, verificationTokenHash) {
      const existing = selectByEmail.get(email);

      if (!existing) {
        const error = new Error('Not found');
        error.code = 'NOT_FOUND';
        throw error;
      }

      if (existing.status === 'verified') {
        return { status: 'already_verified' };
      }

      const now = new Date().toISOString();
      updateTokenForEmail.run(verificationTokenHash, now, now, email);

      return {
        status: 'verification_sent',
        signer: selectByEmail.get(email),
      };
    },

    verifyByTokenHash(tokenHash) {
      const signer = selectByToken.get(tokenHash);

      if (!signer) {
        return null;
      }

      const now = new Date().toISOString();
      verifySigner.run(now, now, signer.id);

      return {
        publicDisplayName: signer.public_display_name,
      };
    },

    findByEmail(email) {
      return selectByEmail.get(email);
    },
  };
}
