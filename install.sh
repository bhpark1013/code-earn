#!/bin/bash
# CodeEarn - one-line installer
# Usage: curl -fsSL https://raw.githubusercontent.com/bhpark1013/code-earn/main/install.sh | bash

set -e

PLUGIN_DIR="$HOME/.claude/plugins/marketplaces/custom/code-earn"
TMP_DIR=$(mktemp -d)

echo ""
echo "  code-earn installer"
echo "  -------------------"
echo ""

# Check if already installed
if [ -d "$PLUGIN_DIR" ]; then
  echo "  Updating existing installation..."
  rm -rf "$PLUGIN_DIR"
fi

# Clone and copy plugin
echo "  Downloading..."
git clone --depth 1 --quiet https://github.com/bhpark1013/code-earn.git "$TMP_DIR" 2>/dev/null

echo "  Installing plugin..."
mkdir -p "$PLUGIN_DIR"
cp -r "$TMP_DIR/plugin/"* "$PLUGIN_DIR/"
cp -r "$TMP_DIR/plugin/.claude-plugin" "$PLUGIN_DIR/"

# Cleanup
rm -rf "$TMP_DIR"

echo "  Running setup..."
echo ""

# Run setup
bash "$PLUGIN_DIR/hooks/setup.sh"

echo ""
echo "  Done. Restart Claude Code to activate."
echo ""
