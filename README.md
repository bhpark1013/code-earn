# code-earn — DevFeed for Claude Code

Read dev news while AI thinks. A Claude Code plugin that surfaces Hacker News, GitHub Trending, and AI releases in your status line during agent wait time.

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/bhpark1013/code-earn/main/install.sh | bash
```

Restart Claude Code. While the agent thinks, a news item rotates into your status line.

## What you see

```
[OMC#4.9.3] | 5h:3% | session:0m | ctx:0%
[feed] HackerNews │ Rust 2.0 compiler is 10x faster than GCC   ▲847  💬234
```

## Sources

- Hacker News top stories
- GitHub trending repos (last 7 days)
- More coming: Product Hunt, Reddit r/programming, AI newsletters

## Privacy

- No prompts, no code, no keystrokes collected
- News is fetched on prompt submit only (rate-limited to 30s)
- All data stays on your machine

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/bhpark1013/code-earn/main/uninstall.sh | bash
```

Cleans plugin files, config, status line, hooks, and `/feed` command. A `settings.json.backup` is written for safety.

## Development

```bash
cd web
npm install
npm run dev
```

## License

MIT
