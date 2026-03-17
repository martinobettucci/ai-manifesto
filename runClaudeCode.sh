#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="${CLAUDE_CODE_IMAGE:-ai-manifesto-claude-code}"
CLAUDE_HOME_VOLUME="${CLAUDE_HOME_VOLUME:-ai-manifesto-claude-code-home}"
WORKSPACE_DIR="${PWD}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker CLI is required but was not found in PATH." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not available. Start Docker and try again." >&2
  exit 1
fi

if [ "$#" -gt 0 ]; then
  COMMAND=("$@")
else
  COMMAND=("claude")
fi

docker build -f "$SCRIPT_DIR/Dockerfile.claude-code" -t "$IMAGE_NAME" "$SCRIPT_DIR"

docker run --rm -it \
  -v "$WORKSPACE_DIR:/workspace" \
  -v "$CLAUDE_HOME_VOLUME:/home/node/.claude" \
  -w /workspace \
  -e ANTHROPIC_API_KEY \
  -e ANTHROPIC_AUTH_TOKEN \
  -e ANTHROPIC_BASE_URL \
  -e HTTP_PROXY \
  -e HTTPS_PROXY \
  -e NO_PROXY \
  "$IMAGE_NAME" \
  "${COMMAND[@]}"
