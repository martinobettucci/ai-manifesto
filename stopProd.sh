#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load .env automatically when present.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Keep fallback behavior consistent with runProd.sh.
if [[ -z "${SMTP_USER:-}" && -n "${SCW_DEFAULT_PROJECT_ID:-}" ]]; then
  export SMTP_USER="SCW_${SCW_DEFAULT_PROJECT_ID}"
fi

if [[ -z "${SMTP_PASS:-}" && -n "${SCW_SECRET_KEY:-}" ]]; then
  export SMTP_PASS="${SCW_SECRET_KEY}"
fi

# `docker compose down` still parses env placeholders in compose.
# Provide harmless placeholders so stopping works even without SMTP secrets loaded.
export SMTP_USER="${SMTP_USER:-placeholder}"
export SMTP_PASS="${SMTP_PASS:-placeholder}"

docker compose -f docker-compose.prod.yml down --remove-orphans
