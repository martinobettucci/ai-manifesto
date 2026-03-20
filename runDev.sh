#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

UI_URL="http://localhost:8080"
MAILPIT_URL="http://localhost:8025"

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

wait_and_open_url() {
  local label="$1"
  local url="$2"
  local max_attempts=90
  local attempt=1

  if ! command -v curl >/dev/null 2>&1; then
    open_url "$url"
    return
  fi

  while (( attempt <= max_attempts )); do
    if curl --silent --show-error --fail --max-time 2 "$url" >/dev/null 2>&1; then
      echo "$label is ready: $url"
      open_url "$url"
      return
    fi

    sleep 1
    ((attempt += 1))
  done

  echo "$label did not respond in time. Open manually: $url"
}

open_dev_pages_when_ready() {
  wait_and_open_url "Web app" "$UI_URL" &
  local web_pid=$!
  wait_and_open_url "Mailpit" "$MAILPIT_URL" &
  local mailpit_pid=$!
  wait "$web_pid"
  wait "$mailpit_pid"
}

opener_pid=""
cleanup() {
  if [[ -n "${opener_pid}" ]]; then
    kill "$opener_pid" >/dev/null 2>&1 || true
  fi
}

if [[ "${OPEN_DEV_PAGES:-true}" == "true" ]]; then
  echo "Will open dev pages when ready:"
  echo "1) Web app: $UI_URL"
  echo "2) Mailpit: $MAILPIT_URL"
  open_dev_pages_when_ready &
  opener_pid=$!
  trap cleanup EXIT
fi

docker compose -f docker-compose.dev.yml up --build --remove-orphans
