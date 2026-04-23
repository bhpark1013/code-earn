#!/usr/bin/env node
/**
 * DevFeed HUD wrapper
 * Calls OMC HUD for main statusline, then appends dev news item from ~/.code-earn/.current-news
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();
const OMC_HUD = join(HOME, ".claude/hud/omc-hud.mjs");
const NEWS_FILE = join(HOME, ".code-earn/.current-news");
const NEWS_TTL_SEC = 600; // Show news for 10 minutes after creation

// Read stdin (Claude Code passes session info as JSON)
let stdinData = "";
try {
  stdinData = readFileSync(0, "utf-8");
} catch {}

// Call OMC HUD with the same stdin
let omcOutput = "";
try {
  const result = spawnSync("node", [OMC_HUD], {
    input: stdinData,
    encoding: "utf-8",
    timeout: 3000,
  });
  omcOutput = (result.stdout || "").trimEnd();
} catch {}

function truncate(s, n) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

function supportsOSC8() {
  const tp = process.env.TERM_PROGRAM || "";
  const term = process.env.TERM || "";
  if (["iTerm.app", "WezTerm", "vscode", "ghostty", "Apple_Terminal"].includes(tp)) return true;
  if (term.includes("kitty") || process.env.KITTY_WINDOW_ID) return true;
  if (process.env.ALACRITTY_SOCKET || process.env.WEZTERM_EXECUTABLE) return true;
  return false;
}

function shortUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.host.replace(/^www\./, "");
    let path = u.pathname || "";
    if (path.length > 24) path = path.slice(0, 23) + "…";
    const s = host + path;
    return s.length <= 36 ? s : s.slice(0, 35) + "…";
  } catch {
    return url.slice(0, 36);
  }
}

// Read current news if exists and fresh
let newsLine = "";
if (existsSync(NEWS_FILE)) {
  try {
    const raw = JSON.parse(readFileSync(NEWS_FILE, "utf-8"));
    const age = (Date.now() - raw.timestamp) / 1000;
    if (age < NEWS_TTL_SEC) {
      const clickable = supportsOSC8();
      const titleMax = clickable ? 80 : 60;
      const title = truncate(raw.title || "", titleMax);
      const source = raw.source || "";
      const url = raw.url || "";
      const scoreStr = raw.score ? ` \x1b[33m▲${raw.score}\x1b[0m` : "";
      const commentsStr = raw.comments
        ? ` \x1b[90m💬${raw.comments}\x1b[0m`
        : "";

      // OSC 8 hyperlink: makes title cmd+clickable in supported terminals
      const titleStyled = url
        ? `\x1b]8;;${url}\x07\x1b[37;4m${title}\x1b[0m\x1b]8;;\x07`
        : `\x1b[37m${title}\x1b[0m`;

      const urlTail = !clickable && url ? `  \x1b[90m${shortUrl(url)}\x1b[0m` : "";

      newsLine =
        `\x1b[90m[feed]\x1b[0m ` +
        `\x1b[36m${source}\x1b[0m ` +
        `\x1b[2m│\x1b[0m ` +
        titleStyled +
        scoreStr +
        commentsStr +
        urlTail;

      // Optional second line: article summary
      const summary = (raw.summary || "").trim();
      if (summary) {
        const summaryText = truncate(summary, 140);
        newsLine += `\n\x1b[90m       ↳\x1b[0m \x1b[2m${summaryText}\x1b[0m`;
      }
    }
  } catch {}
}

// Output: OMC HUD first, then news line on a new line (if present)
if (omcOutput) {
  process.stdout.write(omcOutput);
}
if (newsLine) {
  process.stdout.write("\n" + newsLine);
}
process.stdout.write("\n");
