#!/usr/bin/env bash
# ==============================================================================
# SonicFlow — Linux Desktop Launcher
# Launches SonicFlow as a dedicated standalone desktop application window
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT=4173
DIST_DIR="$DIR/dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "[SonicFlow] Building production bundle..."
  if command -v npm >/dev/null 2>&1; then
    npm run build
  else
    echo "Error: dist directory not found and npm is not installed."
    exit 1
  fi
fi

echo "[SonicFlow] Starting SonicFlow background server on port $PORT..."

# Start lightweight local server (prefer node or python3)
SERVER_PID=""
if command -v node >/dev/null 2>&1 && [ -f "$DIR/node_modules/.bin/vite" ]; then
  npx vite preview --port $PORT --strictPort --host 127.0.0.1 > /dev/null 2>&1 &
  SERVER_PID=$!
elif command -v python3 >/dev/null 2>&1; then
  python3 -m http.server $PORT --directory "$DIST_DIR" --bind 127.0.0.1 > /dev/null 2>&1 &
  SERVER_PID=$!
elif command -v python >/dev/null 2>&1; then
  python -m SimpleHTTPServer $PORT > /dev/null 2>&1 &
  SERVER_PID=$!
else
  echo "Error: Node.js or Python3 is required to run the local server."
  exit 1
fi

cleanup() {
  echo "[SonicFlow] Stopping background server..."
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Wait for server to become responsive
for i in {1..30}; do
  if command -v curl >/dev/null 2>&1; then
    if curl -s "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
      break
    fi
  fi
  sleep 0.1
done

URL="http://127.0.0.1:$PORT"
APP_ARG="--app=$URL"
WINDOW_ARGS="--window-size=1280,820 --class=SonicFlow --name=SonicFlow"

echo "[SonicFlow] Opening SonicFlow player window..."

# Try standalone app mode with installed browsers
if command -v google-chrome-stable >/dev/null 2>&1; then
  google-chrome-stable $APP_ARG $WINDOW_ARGS "$@"
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome $APP_ARG $WINDOW_ARGS "$@"
elif command -v chromium >/dev/null 2>&1; then
  chromium $APP_ARG $WINDOW_ARGS "$@"
elif command -v chromium-browser >/dev/null 2>&1; then
  chromium-browser $APP_ARG $WINDOW_ARGS "$@"
elif command -v brave-browser >/dev/null 2>&1; then
  brave-browser $APP_ARG $WINDOW_ARGS "$@"
elif command -v edge >/dev/null 2>&1; then
  edge $APP_ARG $WINDOW_ARGS "$@"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
else
  echo "[SonicFlow] SonicFlow is running at $URL"
  wait "$SERVER_PID"
fi
