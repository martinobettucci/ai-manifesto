#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

open_url() {
  local url="$1"

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 &
    return
  fi

  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 &
    return
  fi

  echo "Browser opener not found. Open manually: $url"
}

echo "Start dev stack and open web pages?"
echo "1) Web app: http://localhost:8080"
echo "2) Mailpit: http://localhost:8025"
read -r -p "Open both now? [y/N] " answer

if [[ "$answer" =~ ^[Yy]$ ]]; then
  open_url "http://localhost:8080"
  open_url "http://localhost:8025"
fi

docker compose -f docker-compose.dev.yml up --build --remove-orphans
