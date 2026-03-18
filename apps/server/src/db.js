import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { createPublicDisplayName } from './mask.js';

const SIGNERS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS signers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profession TEXT NOT NULL,
    department TEXT NOT NULL,
    locale TEXT NOT NULL,
    public_display_name TEXT NOT NULL,
    ai_professional_consent INTEGER NOT NULL DEFAULT 0,
    professional_website TEXT,
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
  CREATE INDEX IF NOT EXISTS idx_signers_token_hash ON signers(verification_token_hash);
`;

export function createRepository(dbFile) {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

  const db = new Database(dbFile);
  db.pragma('journal_mode = WAL');

  const hasSignersTable = Boolean(
    db
      .prepare(
        `
          SELECT 1
          FROM sqlite_master
          WHERE type = 'table'
            AND name = 'signers'
        `,
      )
      .get(),
  );

  if (hasSignersTable) {
    const columns = db
      .prepare(`PRAGMA table_info(signers)`)
      .all()
      .map((column) => column.name);

    if (columns.includes('email') || columns.includes('full_name')) {
      const legacyAiProfessionalConsent = columns.includes('ai_professional_consent')
        ? 'ai_professional_consent'
        : '0';
      const legacyProfessionalWebsite = columns.includes('professional_website')
        ? 'professional_website'
        : 'NULL';

      db.exec(`
        BEGIN;
        ALTER TABLE signers RENAME TO signers_legacy_without_privacy;

        CREATE TABLE signers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profession TEXT NOT NULL,
          department TEXT NOT NULL,
          locale TEXT NOT NULL,
          public_display_name TEXT NOT NULL,
          ai_professional_consent INTEGER NOT NULL DEFAULT 0,
          professional_website TEXT,
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

        INSERT INTO signers (
          id,
          profession,
          department,
          locale,
          public_display_name,
          ai_professional_consent,
          professional_website,
          diffusion_consent,
          privacy_consent,
          charter_consent,
          status,
          verification_token_hash,
          verification_sent_at,
          verified_at,
          created_at,
          updated_at
        )
        SELECT
          id,
          profession,
          department,
          locale,
          public_display_name,
          ${legacyAiProfessionalConsent},
          ${legacyProfessionalWebsite},
          diffusion_consent,
          privacy_consent,
          charter_consent,
          status,
          verification_token_hash,
          verification_sent_at,
          verified_at,
          created_at,
          updated_at
        FROM signers_legacy_without_privacy;

        DROP TABLE signers_legacy_without_privacy;

        CREATE INDEX IF NOT EXISTS idx_signers_status ON signers(status);
        CREATE INDEX IF NOT EXISTS idx_signers_verified_at ON signers(verified_at DESC);
        CREATE INDEX IF NOT EXISTS idx_signers_token_hash ON signers(verification_token_hash);
        COMMIT;
      `);
    }
  }

  db.exec(SIGNERS_SCHEMA);

  const signerColumns = new Set(
    db
      .prepare(`PRAGMA table_info(signers)`)
      .all()
      .map((column) => column.name),
  );

  if (!signerColumns.has('ai_professional_consent')) {
    db.exec(`
      ALTER TABLE signers
      ADD COLUMN ai_professional_consent INTEGER NOT NULL DEFAULT 0
    `);
  }

  if (!signerColumns.has('professional_website')) {
    db.exec(`
      ALTER TABLE signers
      ADD COLUMN professional_website TEXT
    `);
  }

  const selectDirectory = db.prepare(`
    SELECT
      id,
      public_display_name AS publicDisplayName,
      profession,
      department,
      ai_professional_consent AS aiProfessionalConsent,
      professional_website AS professionalWebsite,
      verified_at AS verifiedAt
    FROM signers
    WHERE status = 'verified'
    ORDER BY datetime(verified_at) DESC, id DESC
  `);

  const countVerified = db.prepare(`
    SELECT COUNT(*) AS total
    FROM signers
    WHERE status = 'verified'
  `);

  const selectByToken = db.prepare(`
    SELECT *
    FROM signers
    WHERE verification_token_hash = ?
      AND status = 'pending'
  `);

  const selectByTokenAnyStatus = db.prepare(`
    SELECT
      id,
      status,
      public_display_name AS publicDisplayName,
      verified_at AS verifiedAt
    FROM signers
    WHERE verification_token_hash = ?
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT 1
  `);

  const countVerifiedPosition = db.prepare(`
    SELECT COUNT(*) + 1 AS position
    FROM signers
    WHERE status = 'verified'
      AND (
        datetime(verified_at) > datetime(@verifiedAt)
        OR (datetime(verified_at) = datetime(@verifiedAt) AND id > @id)
      )
  `);

  const insertSigner = db.prepare(`
    INSERT INTO signers (
      profession,
      department,
      locale,
      public_display_name,
      ai_professional_consent,
      professional_website,
      diffusion_consent,
      privacy_consent,
      charter_consent,
      status,
      verification_token_hash,
      verification_sent_at,
      created_at,
      updated_at
    ) VALUES (
      @profession,
      @department,
      @locale,
      @publicDisplayName,
      @aiProfessionalConsent,
      @professionalWebsite,
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

  const verifySigner = db.prepare(`
    UPDATE signers
    SET
      status = 'verified',
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
      const nextRecord = {
        ...payload,
        publicDisplayName: createPublicDisplayName(payload),
        verificationSentAt: now,
        createdAt: now,
        updatedAt: now,
      };

      insertSigner.run(nextRecord);

      return {
        publicDisplayName: nextRecord.publicDisplayName,
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
        id: signer.id,
        publicDisplayName: signer.public_display_name,
      };
    },

    getSignerStatusByTokenHash(tokenHash) {
      const signer = selectByTokenAnyStatus.get(tokenHash);

      if (!signer) {
        return null;
      }

      if (signer.status !== 'verified') {
        return {
          status: 'pending',
          signer: {
            id: signer.id,
            publicDisplayName: signer.publicDisplayName,
          },
        };
      }

      const position = countVerifiedPosition.get({
        verifiedAt: signer.verifiedAt,
        id: signer.id,
      }).position;

      return {
        status: 'verified',
        signer: {
          id: signer.id,
          publicDisplayName: signer.publicDisplayName,
          verifiedAt: signer.verifiedAt,
          position,
        },
      };
    },
  };
}
