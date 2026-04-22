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

// Read current news if exists and fresh
let newsLine = "";
if (existsSync(NEWS_FILE)) {
  try {
    const raw = JSON.parse(readFileSync(NEWS_FILE, "utf-8"));
    const age = (Date.now() - raw.timestamp) / 1000;
    if (age < NEWS_TTL_SEC) {
      const title = truncate(raw.title || "", 80);
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

      newsLine =
        `\x1b[90m[feed]\x1b[0m ` +
        `\x1b[36m${source}\x1b[0m ` +
        `\x1b[2m│\x1b[0m ` +
        titleStyled +
        scoreStr +
        commentsStr;
    }
  } catch {}
}

function truncate(s, n) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

// Output: OMC HUD first, then news line on a new line (if present)
if (omcOutput) {
  process.stdout.write(omcOutput);
}
if (newsLine) {
  process.stdout.write("\n" + newsLine);
}
process.stdout.write("\n");
