#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Scaleway TEM username can be provided directly or derived from project id.
if [[ -z "${SMTP_USER:-}" && -n "${SCW_SCW_DEFAULT_PROJECT_ID:-}" ]]; then
  export SMTP_USER="${SCW_SCW_DEFAULT_PROJECT_ID}"
fi

if [[ -z "${SMTP_USER:-}" && -n "${SCW_DEFAULT_PROJECT_ID:-}" ]]; then
  export SMTP_USER="SCW_${SCW_DEFAULT_PROJECT_ID}"
fi

if [[ -z "${SMTP_PASS:-}" && -n "${SCW_SECRET_KEY:-}" ]]; then
  export SMTP_PASS="${SCW_SECRET_KEY}"
fi

if [[ -z "${SMTP_USER:-}" ]]; then
  echo "Missing SMTP_USER. Set it explicitly or provide SCW_DEFAULT_PROJECT_ID." >&2
  exit 1
fi

if [[ -z "${SMTP_PASS:-}" ]]; then
  echo "Missing SMTP_PASS. Set it explicitly or provide SCW_SECRET_KEY." >&2
  exit 1
fi

docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
