#!/usr/bin/env bash
set -euo pipefail

TAIL_LINES="${TAIL_LINES:-120}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not reachable. Start Docker (or use sudo/newgrp docker)." >&2
  exit 1
fi

mapfile -t containers < <(docker ps --format '{{.Names}}')

if [[ ${#containers[@]} -eq 0 ]]; then
  echo "No running containers found."
  exit 0
fi

echo "Attaching logs for ${#containers[@]} running container(s). Press Ctrl+C to stop."

declare -a pids=()

cleanup() {
  for pid in "${pids[@]:-}"; do
    kill "$pid" >/dev/null 2>&1 || true
  done
}

trap cleanup INT TERM EXIT

for container in "${containers[@]}"; do
  (
    docker logs --tail "$TAIL_LINES" -f "$container" 2>&1 \
      | sed -u "s/^/[$container] /"
  ) &
  pids+=("$!")
done

wait
