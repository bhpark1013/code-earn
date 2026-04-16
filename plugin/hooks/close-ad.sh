#!/bin/bash
# Report session duration when agent stops

CONFIG_DIR="$HOME/.code-earn"
CONFIG_FILE="$CONFIG_DIR/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  exit 0
fi

ENABLED=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('enabled', False))" 2>/dev/null)
if [ "$ENABLED" != "True" ]; then
  exit 0
fi

SESSION_FILE="$CONFIG_DIR/.current_session"
START_FILE="$CONFIG_DIR/.session_start"

if [ ! -f "$SESSION_FILE" ] || [ ! -f "$START_FILE" ]; then
  exit 0
fi

SESSION_ID=$(cat "$SESSION_FILE")
START_TIME=$(cat "$START_FILE")
NOW=$(date +%s)
DURATION=$((NOW - START_TIME))

USER_ID=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('userId', ''))" 2>/dev/null)
API_URL=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('apiUrl', 'https://web-olive-three-47.vercel.app'))" 2>/dev/null)

# Report session to server (non-blocking)
curl -s --max-time 3 -X POST "${API_URL}/api/session" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"${USER_ID}\", \"sessionId\": \"${SESSION_ID}\", \"duration\": ${DURATION}}" \
  > /dev/null 2>&1 &

# Clean up
rm -f "$SESSION_FILE" "$START_FILE"
