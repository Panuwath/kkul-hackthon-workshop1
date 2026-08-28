#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="$ROOT_DIR/.vscode/sftp.json"

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
command -v ssh >/dev/null || { echo "ssh is required" >&2; exit 1; }
command -v sftp >/dev/null || { echo "sftp is required" >&2; exit 1; }
test -f "$CONFIG_FILE" || { echo "Missing .vscode/sftp.json" >&2; exit 1; }
test -f "$ROOT_DIR/.env" || { echo "Missing .env on the deployment source" >&2; exit 1; }

SERVER_HOST="$(jq -r '.host // empty' "$CONFIG_FILE")"
SERVER_PORT="$(jq -r '.port // 22' "$CONFIG_FILE")"
SERVER_USER="$(jq -r '.username // empty' "$CONFIG_FILE")"
SERVER_PASSWORD="$(jq -r '.password // empty' "$CONFIG_FILE")"
SERVER_KEY="$(jq -r '.privateKeyPath // empty' "$CONFIG_FILE")"
REMOTE_PATH="$(jq -r '.remotePath // empty' "$CONFIG_FILE")"
APP_PORT="$(awk -F= '$1 == "APP_PORT" {print $2; exit}' "$ROOT_DIR/.env")"
APP_PORT="${APP_PORT:-3061}"

if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ] || [ -z "$REMOTE_PATH" ]; then
  echo "sftp.json must provide host, username and remotePath" >&2
  exit 1
fi
case "$APP_PORT" in
  ''|*[!0-9]*) echo "APP_PORT must be numeric" >&2; exit 1 ;;
esac

SSH_OPTIONS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -p "$SERVER_PORT")
SFTP_OPTIONS=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -P "$SERVER_PORT")
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

ARCHIVE_FILE="$(mktemp "${TMPDIR:-/tmp}/pema-kku-deploy.XXXXXX.tar.gz")"
trap 'rm -f "$ARCHIVE_FILE"' EXIT

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
REMOTE_ARCHIVE="$REMOTE_ROOT/deploy.tar.gz"
REMOTE_ENV="$REMOTE_ROOT/.env"
REMOTE_ROOT_Q="$(shell_quote "$REMOTE_ROOT")"
REMOTE_ARCHIVE_Q="$(shell_quote "$REMOTE_ARCHIVE")"
REMOTE_ENV_Q="$(shell_quote "$REMOTE_ENV")"

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
