#!/bin/bash
# Show ad in terminal when agent starts processing

CONFIG_DIR="$HOME/.code-earn"
CONFIG_FILE="$CONFIG_DIR/config.json"

# Check if ads are enabled
if [ ! -f "$CONFIG_FILE" ]; then
  exit 0
fi

ENABLED=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('enabled', False))" 2>/dev/null)
if [ "$ENABLED" != "True" ]; then
  exit 0
fi

USER_ID=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('userId', ''))" 2>/dev/null)
API_URL=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('apiUrl', 'https://web-olive-three-47.vercel.app'))" 2>/dev/null)

if [ -z "$USER_ID" ]; then
  exit 0
fi

# Rate limit: don't show more than once per 90 seconds
LAST_OPEN_FILE="$CONFIG_DIR/.last_open"
if [ -f "$LAST_OPEN_FILE" ]; then
  LAST_OPEN=$(cat "$LAST_OPEN_FILE")
  NOW=$(date +%s)
  DIFF=$((NOW - LAST_OPEN))
  if [ "$DIFF" -lt 90 ]; then
    exit 0
  fi
fi

date +%s > "$LAST_OPEN_FILE"

# Generate session ID
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
echo "$SESSION_ID" > "$CONFIG_DIR/.current_session"
date +%s > "$CONFIG_DIR/.session_start"

# Try Carbon Ads first, fall back to self-served ads
CARBON_TOKEN=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('carbonToken', ''))" 2>/dev/null)

if [ -n "$CARBON_TOKEN" ] && [ "$CARBON_TOKEN" != "None" ]; then
  # Fetch Carbon ad (non-blocking, timeout 2s)
  AD_RESPONSE=$(curl -s --max-time 2 "https://srv.carbonads.net/ads/json?segment=cli&token=${CARBON_TOKEN}" 2>/dev/null)

  if [ -n "$AD_RESPONSE" ]; then
    AD_COMPANY=$(echo "$AD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ads',[])[0].get('company',''))" 2>/dev/null)
    AD_DESC=$(echo "$AD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ads',[])[0].get('description',''))" 2>/dev/null)
    AD_URL=$(echo "$AD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ads',[])[0].get('statlink',''))" 2>/dev/null)
    AD_PIXEL=$(echo "$AD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ads',[])[0].get('statimp',''))" 2>/dev/null)

    if [ -n "$AD_COMPANY" ]; then
      # Track impression
      curl -s --max-time 1 "$AD_PIXEL" > /dev/null 2>&1 &

      AD_PAGE_URL="${API_URL}/ad?uid=${USER_ID}&sid=${SESSION_ID}"

      # Display ad in terminal
      echo ""
      echo "  ─── Sponsored by ${AD_COMPANY} ───"
      echo "  ${AD_DESC}"
      echo "  → ${AD_URL}"
      echo ""
      echo "  💰 광고 보고 추가 수익 받기: ${AD_PAGE_URL}"
      echo "  ────────────────────────────────"
      echo ""
      exit 0
    fi
  fi
fi

# Fallback: fetch ad from our own server
AD_RESPONSE=$(curl -s --max-time 2 "${API_URL}/api/ad?uid=${USER_ID}&sid=${SESSION_ID}" 2>/dev/null)

if [ -n "$AD_RESPONSE" ]; then
  AD_TEXT=$(echo "$AD_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sponsor','CodeCash'))" 2>/dev/null)
  AD_DESC=$(echo "$AD_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('description','Earn while you code'))" 2>/dev/null)
  AD_URL=$(echo "$AD_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('url',''))" 2>/dev/null)

  AD_PAGE_URL="${API_URL}/ad?uid=${USER_ID}&sid=${SESSION_ID}"

  echo ""
  echo "  ─── Sponsored by ${AD_TEXT} ───"
  echo "  ${AD_DESC}"
  [ -n "$AD_URL" ] && echo "  → ${AD_URL}"
  echo ""
  echo "  💰 광고 보고 추가 수익 받기: ${AD_PAGE_URL}"
  echo "  ────────────────────────────────"
  echo ""
fi
