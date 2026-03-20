import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { createPublicDisplayName } from './mask.js';

const SIGNERS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS signers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profession TEXT NOT NULL,
    department TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT '',
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

const ADMIN_AUTH_SCHEMA = `
  CREATE TABLE IF NOT EXISTS admin_magic_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_admin_magic_links_expires_at
    ON admin_magic_links(expires_at);
  CREATE INDEX IF NOT EXISTS idx_admin_magic_links_used_at
    ON admin_magic_links(used_at);

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at
    ON admin_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_revoked_at
    ON admin_sessions(revoked_at);
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
          country TEXT NOT NULL DEFAULT '',
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
          country,
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
          '',
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
  db.exec(ADMIN_AUTH_SCHEMA);

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

  if (!signerColumns.has('country')) {
    db.exec(`
      ALTER TABLE signers
      ADD COLUMN country TEXT NOT NULL DEFAULT ''
    `);
  }

  const selectDirectory = db.prepare(`
    SELECT
      id,
      public_display_name AS publicDisplayName,
      profession,
      department,
      country,
      ai_professional_consent AS aiProfessionalConsent,
      professional_website AS professionalWebsite,
      verified_at AS verifiedAt
    FROM signers
    WHERE status = 'verified'
    ORDER BY datetime(verified_at) ASC, id ASC
  `);

  const countVerified = db.prepare(`
    SELECT COUNT(*) AS total
    FROM signers
    WHERE status = 'verified'
  `);

  const selectAdminDataroom = db.prepare(`
    SELECT
      id,
      profession,
      department,
      country,
      locale,
      public_display_name AS publicDisplayName,
      ai_professional_consent AS aiProfessionalConsent,
      professional_website AS professionalWebsite,
      diffusion_consent AS diffusionConsent,
      privacy_consent AS privacyConsent,
      charter_consent AS charterConsent,
      status,
      verification_sent_at AS verificationSentAt,
      verified_at AS verifiedAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM signers
    ORDER BY datetime(created_at) DESC, id DESC
  `);

  const selectAdminSignerById = db.prepare(`
    SELECT
      id,
      profession,
      department,
      country,
      locale,
      public_display_name AS publicDisplayName,
      ai_professional_consent AS aiProfessionalConsent,
      professional_website AS professionalWebsite,
      diffusion_consent AS diffusionConsent,
      privacy_consent AS privacyConsent,
      charter_consent AS charterConsent,
      status,
      verification_sent_at AS verificationSentAt,
      verified_at AS verifiedAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM signers
    WHERE id = ?
    LIMIT 1
  `);

  const countAdminDataroomByStatus = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) AS verified
    FROM signers
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
        datetime(verified_at) < datetime(@verifiedAt)
        OR (datetime(verified_at) = datetime(@verifiedAt) AND id < @id)
      )
  `);

  const insertSigner = db.prepare(`
    INSERT INTO signers (
      profession,
      department,
      country,
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
      @country,
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

  const insertAdminSigner = db.prepare(`
    INSERT INTO signers (
      profession,
      department,
      country,
      locale,
      public_display_name,
      ai_professional_consent,
      professional_website,
      diffusion_consent,
      privacy_consent,
      charter_consent,
      status,
      verification_sent_at,
      verified_at,
      created_at,
      updated_at
    ) VALUES (
      @profession,
      @department,
      @country,
      @locale,
      @publicDisplayName,
      @aiProfessionalConsent,
      @professionalWebsite,
      @diffusionConsent,
      @privacyConsent,
      @charterConsent,
      @status,
      @verificationSentAt,
      @verifiedAt,
      @createdAt,
      @updatedAt
    )
  `);

  const updateAdminSignerById = db.prepare(`
    UPDATE signers
    SET
      profession = @profession,
      department = @department,
      country = @country,
      locale = @locale,
      public_display_name = @publicDisplayName,
      ai_professional_consent = @aiProfessionalConsent,
      professional_website = @professionalWebsite,
      diffusion_consent = @diffusionConsent,
      privacy_consent = @privacyConsent,
      charter_consent = @charterConsent,
      status = @status,
      verification_sent_at = @verificationSentAt,
      verified_at = @verifiedAt,
      updated_at = @updatedAt
    WHERE id = @id
  `);

  const deleteSignerById = db.prepare(`
    DELETE FROM signers
    WHERE id = ?
  `);

  const insertAdminMagicLink = db.prepare(`
    INSERT INTO admin_magic_links (
      token_hash,
      expires_at,
      created_at
    ) VALUES (?, ?, ?)
  `);

  const selectActiveAdminMagicLinkByTokenHash = db.prepare(`
    SELECT id, token_hash AS tokenHash, expires_at AS expiresAt
    FROM admin_magic_links
    WHERE token_hash = ?
      AND used_at IS NULL
      AND expires_at > ?
    LIMIT 1
  `);

  const markAdminMagicLinkAsUsed = db.prepare(`
    UPDATE admin_magic_links
    SET used_at = ?
    WHERE id = ?
      AND used_at IS NULL
  `);

  const insertAdminSession = db.prepare(`
    INSERT INTO admin_sessions (
      session_hash,
      expires_at,
      created_at,
      last_seen_at
    ) VALUES (?, ?, ?, ?)
  `);

  const selectActiveAdminSessionByHash = db.prepare(`
    SELECT
      id,
      session_hash AS sessionHash,
      expires_at AS expiresAt,
      created_at AS createdAt,
      last_seen_at AS lastSeenAt
    FROM admin_sessions
    WHERE session_hash = ?
      AND revoked_at IS NULL
      AND expires_at > ?
    LIMIT 1
  `);

  const touchAdminSessionStmt = db.prepare(`
    UPDATE admin_sessions
    SET last_seen_at = ?
    WHERE id = ?
  `);

  const revokeAdminSessionByHashStmt = db.prepare(`
    UPDATE admin_sessions
    SET revoked_at = ?
    WHERE session_hash = ?
      AND revoked_at IS NULL
  `);

  const deleteExpiredAdminMagicLinks = db.prepare(`
    DELETE FROM admin_magic_links
    WHERE expires_at <= ?
       OR used_at IS NOT NULL
  `);

  const deleteExpiredOrRevokedAdminSessions = db.prepare(`
    DELETE FROM admin_sessions
    WHERE expires_at <= ?
       OR revoked_at IS NOT NULL
  `);

  const consumeAdminMagicLink = db.transaction((tokenHash, nowIso) => {
    const magicLink = selectActiveAdminMagicLinkByTokenHash.get(tokenHash, nowIso);

    if (!magicLink) {
      return null;
    }

    const updateResult = markAdminMagicLinkAsUsed.run(nowIso, magicLink.id);

    if (updateResult.changes !== 1) {
      return null;
    }

    return magicLink;
  });

  return {
    cleanupExpiredAdminAuth(nowIso = new Date().toISOString()) {
      deleteExpiredAdminMagicLinks.run(nowIso);
      deleteExpiredOrRevokedAdminSessions.run(nowIso);
    },

    getDirectory() {
      return {
        total: countVerified.get().total,
        signers: selectDirectory.all(),
      };
    },

    getAdminDataroom() {
      const counts = countAdminDataroomByStatus.get();

      return {
        total: counts.total ?? 0,
        pending: counts.pending ?? 0,
        verified: counts.verified ?? 0,
        signers: selectAdminDataroom.all(),
      };
    },

    getAdminSignerById(id) {
      return selectAdminSignerById.get(id) ?? null;
    },

    createAdminSigner(payload) {
      const now = new Date().toISOString();
      const insertResult = insertAdminSigner.run({
        ...payload,
        createdAt: now,
        updatedAt: now,
      });

      return selectAdminSignerById.get(Number(insertResult.lastInsertRowid)) ?? null;
    },

    updateAdminSigner(id, payload) {
      const updatedAt = new Date().toISOString();
      const updateResult = updateAdminSignerById.run({
        id,
        ...payload,
        updatedAt,
      });

      if (updateResult.changes !== 1) {
        return null;
      }

      return selectAdminSignerById.get(id) ?? null;
    },

    deleteAdminSignerById(id) {
      const deleteResult = deleteSignerById.run(id);
      return deleteResult.changes === 1;
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

    createAdminMagicLink({ tokenHash, expiresAt }) {
      const now = new Date().toISOString();

      insertAdminMagicLink.run(tokenHash, expiresAt, now);
    },

    consumeAdminMagicLinkByTokenHash(tokenHash) {
      return consumeAdminMagicLink(tokenHash, new Date().toISOString());
    },

    createAdminSession({ sessionHash, expiresAt }) {
      const now = new Date().toISOString();

      insertAdminSession.run(sessionHash, expiresAt, now, now);
    },

    getActiveAdminSessionByHash(sessionHash) {
      return selectActiveAdminSessionByHash.get(sessionHash, new Date().toISOString()) ?? null;
    },

    touchAdminSession(sessionId) {
      touchAdminSessionStmt.run(new Date().toISOString(), sessionId);
    },

    revokeAdminSessionByHash(sessionHash) {
      revokeAdminSessionByHashStmt.run(new Date().toISOString(), sessionHash);
    },
  };
}
