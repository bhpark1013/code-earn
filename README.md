# code-earn

Earn money while waiting for AI agent responses. A Claude Code plugin that displays text ads during idle time.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/bhpark1013/code-earn/main/install.sh | bash
```

Restart Claude Code. Ads will appear in the terminal when you submit prompts.

## How it works

1. You submit a prompt to Claude Code
2. A short text ad appears in the terminal while the agent thinks
3. Earnings are tracked and shown in the [dashboard](https://web-olive-three-47.vercel.app/dashboard)

## Disable / Uninstall

```bash
# Disable ads (keep plugin installed)
bash ~/.claude/plugins/marketplaces/custom/code-earn/hooks/setup.sh

# Uninstall completely
rm -rf ~/.claude/plugins/marketplaces/custom/code-earn
rm -rf ~/.code-earn
```

## Development

```bash
cd web
npm install
npm run dev
```

## License

MIT
