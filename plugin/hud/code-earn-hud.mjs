#!/usr/bin/env node
/**
 * code-earn statusline.
 *
 * Renders the current dev-news item from ~/.code-earn/.current-news.
 * Optionally chains an upstream statusline command set in
 * ~/.code-earn/config.json under `parentStatusLine` — its stdout is
 * prepended so users can keep their existing statusline (OMC HUD, git
 * status, custom script, …) above the news block.
 *
 * Self-contained: no hard dependency on any other plugin.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();
const CONFIG_FILE = join(HOME, ".code-earn/config.json");
const NEWS_FILE = join(HOME, ".code-earn/.current-news");
const NEWS_TTL_SEC = 3600;

let stdinData = "";
try {
  stdinData = readFileSync(0, "utf-8");
} catch {}

let parentOutput = "";
if (existsSync(CONFIG_FILE)) {
  try {
    const cfg = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    const parentCmd = (cfg.parentStatusLine || "").trim();
    if (parentCmd) {
      const result = spawnSync(parentCmd, [], {
        shell: true,
        input: stdinData,
        encoding: "utf-8",
        timeout: 3000,
      });
      parentOutput = (result.stdout || "").trimEnd();
    }
  } catch {}
}

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

      const summary = (raw.summary || "").trim();
      if (summary) {
        const summaryText = truncate(summary, 500);
        newsLine += `\n\x1b[90m       ↳\x1b[0m \x1b[2m${summaryText}\x1b[0m`;
      }
    }
  } catch {}
}

function truncate(s, n) {
  if (!s) return "";
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

if (parentOutput) {
  process.stdout.write(parentOutput);
}
if (newsLine) {
  process.stdout.write((parentOutput ? "\n" : "") + newsLine);
}
process.stdout.write("\n");
