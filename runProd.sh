#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load .env automatically for local production runs.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [[ -z "${SMTP_USER:-}" ]]; then
  echo "Missing SMTP_USER. Set it explicitly in your environment or .env file." >&2
  exit 1
fi

if [[ -z "${SMTP_PASS:-}" ]]; then
  echo "Missing SMTP_PASS. Set it explicitly in your environment or .env file." >&2
  exit 1
fi

docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
