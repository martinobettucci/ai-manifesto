#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "This installer supports Linux servers only." >&2
  exit 1
fi

SUDO=""
if [[ "${EUID}" -ne 0 ]]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    echo "Please run as root or install sudo first." >&2
    exit 1
  fi
fi

run_as_root() {
  if [[ -n "$SUDO" ]]; then
    "$SUDO" "$@"
  else
    "$@"
  fi
}

install_docker_if_missing() {
  if command -v docker >/dev/null 2>&1; then
    echo "Docker is already installed."
    return
  fi

  echo "Installing Docker..."

  if [[ -f /etc/debian_version ]]; then
    run_as_root apt-get update
    run_as_root apt-get install -y ca-certificates curl
    curl -fsSL https://get.docker.com | run_as_root sh
    return
  fi

  if command -v dnf >/dev/null 2>&1; then
    run_as_root dnf install -y dnf-plugins-core
    run_as_root dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
    run_as_root dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    return
  fi

  echo "Unsupported Linux distribution. Install Docker manually and rerun this script." >&2
  exit 1
}

install_compose_if_missing() {
  if docker compose version >/dev/null 2>&1; then
    echo "Docker Compose plugin is already installed."
    return
  fi

  echo "Installing Docker Compose plugin..."

  if [[ -f /etc/debian_version ]]; then
    run_as_root apt-get update
    run_as_root apt-get install -y docker-compose-plugin
    return
  fi

  if command -v dnf >/dev/null 2>&1; then
    run_as_root dnf install -y docker-compose-plugin
    return
  fi

  echo "Could not install Docker Compose automatically on this distribution." >&2
  exit 1
}

ensure_docker_service() {
  if command -v systemctl >/dev/null 2>&1; then
    run_as_root systemctl enable --now docker
  fi
}

ADDED_TO_DOCKER_GROUP=0
ensure_docker_group_membership() {
  if [[ "${EUID}" -eq 0 ]]; then
    return
  fi

  if id -nG "$USER" | tr ' ' '\n' | grep -qx docker; then
    return
  fi

  echo "Adding $USER to docker group..."
  run_as_root usermod -aG docker "$USER"
  ADDED_TO_DOCKER_GROUP=1
}

load_env_file() {
  if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi
}

run_production_stack() {
  mkdir -p data

  if docker info >/dev/null 2>&1; then
    ./runProd.sh
    return
  fi

  if [[ -n "$SUDO" ]]; then
    run_as_root ./runProd.sh
    return
  fi

  ./runProd.sh
}

install_docker_if_missing
install_compose_if_missing
ensure_docker_service
ensure_docker_group_membership
load_env_file
run_production_stack

if [[ "$ADDED_TO_DOCKER_GROUP" -eq 1 ]]; then
  echo
  echo "Install completed. You were added to the docker group."
  echo "Log out/in (or run: newgrp docker) before running docker commands without sudo."
fi
