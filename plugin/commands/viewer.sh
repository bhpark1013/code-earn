#!/bin/bash
# Launch the code-earn news viewer in a split pane (tmux) or new window (macOS)

set -e

PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
VIEWER="$PLUGIN_ROOT/commands/viewer.py"

if [ ! -f "$VIEWER" ]; then
  echo "  Error: viewer script not found at $VIEWER"
  exit 1
fi

if [ -n "$TMUX" ]; then
  # Running inside tmux -> vertical split (40% width on the right)
  tmux split-window -h -p 35 "python3 $VIEWER"
  tmux select-pane -L
  echo "  Opened news viewer in a tmux split (Ctrl+b → arrow to focus it, Ctrl+b x to close)"
  exit 0
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS: open a new Terminal window
  osascript <<EOF
tell application "Terminal"
  do script "python3 '$VIEWER'"
  activate
end tell
EOF
  echo "  Opened news viewer in a new Terminal window"
  exit 0
fi

echo "  Not inside tmux. To run the viewer in another terminal:"
echo "    python3 $VIEWER"
