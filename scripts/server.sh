#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8000}
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Serve ./public by default (no build step)
DIR=${DIR:-"$ROOT/public"}
if [[ ! -d "$DIR" ]]; then
  DIR="$ROOT"
fi
PID_FILE="$DIR/.server.pid"
LOG_FILE="$DIR/.server.log"

detect_python() {
  # Some Windows environments expose broken python/python3 app aliases.
  # Accept a candidate only if `--version` actually runs.
  if command -v python >/dev/null 2>&1 && python --version >/dev/null 2>&1; then
    echo "python"
    return 0
  fi
  if command -v python3 >/dev/null 2>&1 && python3 --version >/dev/null 2>&1; then
    echo "python3"
    return 0
  fi
  if [[ -n "${LOCALAPPDATA:-}" ]]; then
    local py_path="$LOCALAPPDATA/Programs/Python/Python312/python.exe"
    if [[ -x "$py_path" ]] && "$py_path" --version >/dev/null 2>&1; then
      echo "$py_path"
      return 0
    fi
  fi
  return 1
}

is_running() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null 2>&1; then
      return 0
    else
      rm -f "$PID_FILE"
    fi
  fi
  return 1
}

start_server() {
  if is_running; then
    echo "Server already running on port $PORT (pid $(cat "$PID_FILE"))"
    exit 0
  fi
  local py
  if ! py=$(detect_python); then
    echo "Python runtime not found. Install Python 3 and ensure it is in PATH."
    echo "Tried: python3, python"
    exit 1
  fi
  echo "Starting server on port $PORT..."
  nohup "$py" "$ROOT/scripts/static_serve.py" --port "$PORT" --dir "$DIR" > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  sleep 0.6
  if is_running; then
    echo "Server started (pid $(cat "$PID_FILE"))"
  else
    echo "Server failed to start. See log: $LOG_FILE"
    [[ -f "$LOG_FILE" ]] && tail -n 40 "$LOG_FILE"
    exit 1
  fi
}

stop_server() {
  if ! is_running; then
    echo "Server not running"
    exit 0
  fi
  local pid
  pid=$(cat "$PID_FILE")
  echo "Stopping server (pid $pid)..."
  kill "$pid" || true
  rm -f "$PID_FILE"
  echo "Server stopped"
}

status_server() {
  if is_running; then
    echo "Server running on port $PORT (pid $(cat "$PID_FILE"))"
  else
    echo "Server not running"
  fi
}

case "${1:-toggle}" in
  start) start_server ;;
  stop) stop_server ;;
  toggle)
    if is_running; then
      stop_server
    else
      start_server
    fi
    ;;
  status) status_server ;;
  *)
    echo "Usage: $0 {start|stop|toggle|status}"
    exit 1
    ;;
esac
