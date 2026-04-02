#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies
npm install

# Free port 5173 if already in use
kill $(lsof -ti:5173) 2>/dev/null || true
sleep 1

# Start Vite dev server in background
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/vite-dev.log 2>&1 &

# Wait until the server responds
for i in $(seq 1 30); do
  if curl -sf http://localhost:5173 > /dev/null 2>&1; then
    echo "Vite dev server ready at http://localhost:5173"
    exit 0
  fi
  sleep 1
done

echo "Warning: Vite dev server did not respond within 30s — check /tmp/vite-dev.log" >&2
