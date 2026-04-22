#!/usr/bin/env python3
"""Fetch a dev news item and write it to .current-news for the statusline to pick up."""

import json
import os
import sys
import time
import urllib.request

CONFIG_DIR = os.path.expanduser("~/.code-earn")
os.makedirs(CONFIG_DIR, exist_ok=True)
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
LAST_OPEN_FILE = os.path.join(CONFIG_DIR, ".last_open")
SESSION_FILE = os.path.join(CONFIG_DIR, ".current_session")
START_FILE = os.path.join(CONFIG_DIR, ".session_start")
CURRENT_NEWS_FILE = os.path.join(CONFIG_DIR, ".current-news")
LOG_FILE = os.path.join(CONFIG_DIR, "hook.log")

DEFAULT_API = "https://web-olive-three-47.vercel.app"
RATE_LIMIT_SEC = 30  # Fetch new news at most every 30s


def log(msg):
    try:
        with open(LOG_FILE, "a") as f:
            f.write(f"[{time.strftime('%H:%M:%S')}] {msg}\n")
    except Exception:
        pass


def load_config():
    if not os.path.exists(CONFIG_FILE):
        return None
    try:
        with open(CONFIG_FILE) as f:
            return json.load(f)
    except Exception:
        return None


def is_rate_limited():
    if not os.path.exists(LAST_OPEN_FILE):
        return False
    try:
        with open(LAST_OPEN_FILE) as f:
            last = float(f.read().strip())
        return (time.time() - last) < RATE_LIMIT_SEC
    except Exception:
        return False


def save_timestamp():
    with open(LAST_OPEN_FILE, "w") as f:
        f.write(str(time.time()))


def fetch_news(api_url):
    try:
        url = f"{api_url}/api/news?limit=5"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=3) as resp:
            return json.loads(resp.read())
    except Exception as e:
        log(f"fetch error: {e}")
        return None


def pass_through():
    print(json.dumps({"continue": True, "suppressOutput": True}))


def main():
    log("news hook invoked")

    # Read stdin and check if user is invoking a slash command or meta action
    # If so, skip news rotation to avoid changing state they're inspecting
    stdin_data = {}
    try:
        stdin_data = json.load(sys.stdin)
    except Exception:
        pass

    prompt = (stdin_data.get("prompt") or "").strip()
    if prompt.startswith("/feed") or prompt.startswith("/news"):
        log("skipping: user invoked feed command")
        pass_through()
        return

    config = load_config()
    # Config is optional for news (no auth required)
    enabled = True
    api_url = DEFAULT_API
    if config:
        enabled = config.get("newsEnabled", config.get("enabled", True))
        api_url = config.get("apiUrl", DEFAULT_API)

    if not enabled:
        log("news disabled")
        pass_through()
        return

    if is_rate_limited():
        log("rate limited, keeping existing news")
        pass_through()
        return

    save_timestamp()

    # Track session for analytics (optional)
    if config and config.get("userId"):
        import uuid
        session_id = str(uuid.uuid4())
        with open(SESSION_FILE, "w") as f:
            f.write(session_id)
        with open(START_FILE, "w") as f:
            f.write(str(time.time()))

    response = fetch_news(api_url)
    if not response or not response.get("pick"):
        log("no news received")
        pass_through()
        return

    pick = response["pick"]
    log(f"showing news: {pick.get('title', '')[:50]}")

    # Write news item to file for statusline to render
    with open(CURRENT_NEWS_FILE, "w") as f:
        json.dump({
            "title": pick.get("title", ""),
            "url": pick.get("url", ""),
            "source": pick.get("source", ""),
            "score": pick.get("score"),
            "comments": pick.get("comments"),
            "timestamp": int(time.time() * 1000),
        }, f)

    pass_through()


if __name__ == "__main__":
    main()
