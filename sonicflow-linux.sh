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

# Start lightweight local server (prefer node or python3 with explicit MIME types)
SERVER_PID=""
if command -v node >/dev/null 2>&1; then
  node -e '
    const http = require("http");
    const fs = require("fs");
    const path = require("path");
    const dist = process.argv[1];
    const port = parseInt(process.argv[2], 10);
    const mime = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".ico": "image/x-icon",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".mp3": "audio/mpeg"
    };
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split("?")[0];
      let filePath = path.join(dist, reqPath);
      try {
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(dist, "index.html");
        }
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "no-cache");
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.statusCode = 500;
        res.end("Internal Error");
      }
    });
    server.listen(port, "127.0.0.1");
  ' "$DIST_DIR" "$PORT" > /dev/null 2>&1 &
  SERVER_PID=$!
elif command -v python3 >/dev/null 2>&1; then
  python3 -c '
import sys, http.server, socketserver, mimetypes
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=sys.argv[1], **kwargs)
with socketserver.TCPServer(("127.0.0.1", int(sys.argv[2])), Handler) as httpd:
    httpd.serve_forever()
' "$DIST_DIR" "$PORT" > /dev/null 2>&1 &
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
