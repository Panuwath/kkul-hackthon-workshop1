#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/.vscode/sftp.json"
ENV_FILE="${DEPLOY_ENV_FILE:-$ROOT_DIR/.env}"

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
command -v ssh >/dev/null || { echo "ssh is required" >&2; exit 1; }
command -v sftp >/dev/null || { echo "sftp is required" >&2; exit 1; }
test -f "$ENV_FILE" || { echo "Missing deployment environment file" >&2; exit 1; }

env_value() {
  awk -F= -v key="$1" '$1 == key {sub(/^[[:space:]]+/, "", $2); sub(/[[:space:]]+$/, "", $2); gsub(/^"|"$/, "", $2); print $2; exit}' "$ENV_FILE"
}

if [ -n "${DEPLOY_HOST:-}" ]; then
  SERVER_HOST="$DEPLOY_HOST"
  SERVER_PORT="${DEPLOY_PORT:-22}"
  SERVER_USER="${DEPLOY_USER:-}"
  SERVER_PASSWORD="${DEPLOY_PASSWORD:-}"
  SERVER_KEY="${DEPLOY_SSH_KEY_FILE:-}"
  REMOTE_PATH="${DEPLOY_PATH:-}"
else
  test -f "$CONFIG_FILE" || { echo "Missing .vscode/sftp.json" >&2; exit 1; }
  SERVER_HOST="$(jq -r '.host // empty' "$CONFIG_FILE")"
  SERVER_PORT="$(jq -r '.port // 22' "$CONFIG_FILE")"
  SERVER_USER="$(jq -r '.username // empty' "$CONFIG_FILE")"
  SERVER_PASSWORD="$(jq -r '.password // empty' "$CONFIG_FILE")"
  SERVER_KEY="$(jq -r '.privateKeyPath // empty' "$CONFIG_FILE")"
  REMOTE_PATH="$(jq -r '.remotePath // empty' "$CONFIG_FILE")"
fi

APP_PORT="${APP_PORT:-$(env_value APP_PORT)}"
APP_PORT="${APP_PORT:-3061}"
AUTH_MODE="$(env_value AUTH_MODE)"

if [ -z "$(env_value AUTH_JWT_SECRET)" ]; then
  echo "Production deployment requires a non-empty AUTH_JWT_SECRET in the deployment environment" >&2
  exit 1
fi
if [ -n "$AUTH_MODE" ] && [ "$AUTH_MODE" != "jwt" ]; then
  echo "Production deployment requires AUTH_MODE=jwt" >&2
  exit 1
fi

if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ] || [ -z "$REMOTE_PATH" ]; then
  echo "Deployment requires host, user and remote path" >&2
  exit 1
fi
case "$APP_PORT" in
  ''|*[!0-9]*) echo "APP_PORT must be numeric" >&2; exit 1 ;;
esac

SSH_OPTIONS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -p "$SERVER_PORT")
SFTP_OPTIONS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -P "$SERVER_PORT")
if [ -n "${SSH_KNOWN_HOSTS_FILE:-}" ]; then
  SSH_OPTIONS+=(-o UserKnownHostsFile="$SSH_KNOWN_HOSTS_FILE")
  SFTP_OPTIONS+=(-o UserKnownHostsFile="$SSH_KNOWN_HOSTS_FILE")
fi
if [ -n "$SERVER_KEY" ] && [ -f "$SERVER_KEY" ]; then
  SSH_OPTIONS+=(-i "$SERVER_KEY")
  SFTP_OPTIONS+=(-i "$SERVER_KEY")
fi

run_ssh() {
  if [ -n "$SERVER_PASSWORD" ]; then
    SSHPASS="$SERVER_PASSWORD" sshpass -e ssh "${SSH_OPTIONS[@]}" "$SERVER_USER@$SERVER_HOST" "$1"
  else
    ssh "${SSH_OPTIONS[@]}" "$SERVER_USER@$SERVER_HOST" "$1"
  fi
}

run_sftp_batch() {
  if [ -n "$SERVER_PASSWORD" ]; then
    SSHPASS="$SERVER_PASSWORD" sshpass -e sftp "${SFTP_OPTIONS[@]}" -b - "$SERVER_USER@$SERVER_HOST"
  else
    sftp "${SFTP_OPTIONS[@]}" -b - "$SERVER_USER@$SERVER_HOST"
  fi
}

shell_quote() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"
}

ARCHIVE_FILE="$(mktemp "${TMPDIR:-/tmp}/pema-kku-deploy.XXXXXX")"
trap 'rm -f "$ARCHIVE_FILE"' EXIT

DEPLOY_RUN_ID="${DEPLOY_RUN_ID:-local-$(date +%s)}"
DEPLOY_RUN_ID="${DEPLOY_RUN_ID//[^A-Za-z0-9_.-]/-}"
DEPLOY_REVISION="${DEPLOY_REVISION:-unknown}"

tar -czf "$ARCHIVE_FILE" \
  --exclude='./.git' \
  --exclude='./.env' \
  --exclude='./.vscode' \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./coverage' \
  --exclude='./*.tar.gz' \
  -C "$ROOT_DIR" .

REMOTE_ROOT="${REMOTE_PATH%/}"
REMOTE_ARCHIVE="$REMOTE_ROOT/.pema-deploy-${DEPLOY_RUN_ID}.tar.gz"
REMOTE_ENV="$REMOTE_ROOT/.env"
REMOTE_REVISION="$REMOTE_ROOT/.deploy-revision"
REMOTE_ROOT_Q="$(shell_quote "$REMOTE_ROOT")"
REMOTE_ARCHIVE_Q="$(shell_quote "$REMOTE_ARCHIVE")"
REMOTE_ENV_Q="$(shell_quote "$REMOTE_ENV")"
REMOTE_REVISION_Q="$(shell_quote "$REMOTE_REVISION")"
DEPLOY_REVISION_Q="$(shell_quote "$DEPLOY_REVISION")"

echo "Preparing remote directory"
run_ssh "mkdir -p -- $REMOTE_ROOT_Q"

echo "Uploading deployment archive"
printf 'put %s %s\n' "$(shell_quote "$ARCHIVE_FILE")" "$REMOTE_ARCHIVE_Q" | run_sftp_batch

echo "Uploading runtime environment separately"
printf 'put %s %s\n' "$(shell_quote "$ROOT_DIR/.env")" "$REMOTE_ENV_Q" | run_sftp_batch

echo "Checking port $APP_PORT and deploying"
run_ssh "set -eu
chmod 600 $REMOTE_ENV_Q
if ss -ltnH | grep -Eq '[:.]${APP_PORT}[[:space:]]'; then
  if ! docker ps --format '{{.Names}}' | grep -qx 'pema-kku-app'; then
    echo 'APP_PORT is already in use by another service' >&2
    exit 42
  fi
fi
tar -xzf $REMOTE_ARCHIVE_Q -C $REMOTE_ROOT_Q
rm -f $REMOTE_ARCHIVE_Q
printf '%s\n' $DEPLOY_REVISION_Q > $REMOTE_REVISION_Q
cd $REMOTE_ROOT_Q
APP_PORT=$APP_PORT docker compose -p pema-kku up -d --build
APP_PORT=$APP_PORT docker compose -p pema-kku ps
ready=0
for attempt in \$(seq 1 30); do
  if curl -fsS --max-time 5 http://127.0.0.1:$APP_PORT/pema/api/health >/dev/null; then
    ready=1
    break
  fi
  sleep 2
done
if [ "\$ready" -ne 1 ]; then
  echo 'PEMA health check did not become ready' >&2
  APP_PORT=$APP_PORT docker compose -p pema-kku logs --tail 80 app >&2 || true
  exit 1
fi
echo DEPLOY_HEALTH_OK"

echo "Deployment completed on port $APP_PORT"
