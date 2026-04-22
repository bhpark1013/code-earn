# code-earn — DevFeed for Claude Code

Read dev news while AI thinks. A Claude Code plugin that surfaces Hacker News and GitHub Trending in your status line during agent wait time.

## Install

Inside Claude Code:

```
/plugin marketplace add bhpark1013/code-earn
/plugin install code-earn@code-earn
/code-earn:setup
```

Restart Claude Code. While the agent thinks, a news item rotates into your status line.

## What you see

```
[OMC#4.9.3] | 5h:3% | session:0m | ctx:0%
[feed] HackerNews │ Rust 2.0 compiler is 10x faster than GCC   ▲847  💬234
```

## Commands

| Command | What it does |
|---------|--------------|
| `/code-earn:setup` | Wire the status line wrapper (run once after install) |
| `/code-earn:feed` | Expand the current news item (HN comments, etc.) |
| `/code-earn:feed latest` | Show the 5 most recent news items |
| `/code-earn:teardown` | Remove status line wiring (before `/plugin remove`) |

## Sources

- Hacker News top stories
- GitHub trending repos (last 7 days)
- More coming: Product Hunt, Reddit r/programming, AI newsletters

## Privacy

- No prompts, no code, no keystrokes collected
- News is fetched on prompt submit only (rate-limited to 30s)
- All data stays on your machine

## Uninstall

```
/code-earn:teardown
/plugin remove code-earn
```

## Development

```bash
cd web
npm install
npm run dev
```

## License

MIT
