#!/bin/bash
# code-earn statusLine wiring
# Runs via /code-earn:setup slash command. Idempotent.

set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
SRC_HUD="$PLUGIN_ROOT/hud/code-earn-hud.mjs"
DST_HUD_DIR="$HOME/.claude/hud"
DST_HUD="$DST_HUD_DIR/code-earn-hud.mjs"
SETTINGS="$HOME/.claude/settings.json"

if [ ! -f "$SRC_HUD" ]; then
  echo "  Error: HUD wrapper not found at $SRC_HUD"
  exit 1
fi

mkdir -p "$DST_HUD_DIR"
cp "$SRC_HUD" "$DST_HUD"
chmod +x "$DST_HUD"

if [ -f "$SETTINGS" ]; then
  python3 - "$SETTINGS" "$DST_HUD" <<'PY'
import json, sys, shutil
path, hud = sys.argv[1], sys.argv[2]
shutil.copyfile(path, path + ".backup")
with open(path) as f:
    data = json.load(f)
current = data.get("statusLine", {}).get("command", "")
if "code-earn-hud" not in current:
    data["statusLine"] = {"type": "command", "command": f"node {hud}"}
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    print(f"  statusLine updated: {hud}")
else:
    print("  statusLine already points at code-earn-hud — no change")
PY
fi

echo ""
echo "  Done. Restart Claude Code for the status line to take effect."
