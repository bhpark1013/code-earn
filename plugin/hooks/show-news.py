#!/usr/bin/env python3
"""Fetch a dev news item and write it to .current-news for the statusline to pick up."""

import json
import locale as _locale
import os
import subprocess
import sys
import time
import urllib.request

from background_claude import BACKGROUND_CHILD_ENV, build_background_env

CONFIG_DIR = os.path.expanduser("~/.code-earn")
os.makedirs(CONFIG_DIR, exist_ok=True)
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
LAST_OPEN_FILE = os.path.join(CONFIG_DIR, ".last_open")
SESSION_FILE = os.path.join(CONFIG_DIR, ".current_session")
START_FILE = os.path.join(CONFIG_DIR, ".session_start")
CURRENT_NEWS_FILE = os.path.join(CONFIG_DIR, ".current-news")
LOG_FILE = os.path.join(CONFIG_DIR, "hook.log")
TRANSLATION_CACHE = os.path.join(CONFIG_DIR, ".translation-cache.json")
SUMMARY_CACHE = os.path.join(CONFIG_DIR, ".summary-cache.json")
TRANSLATOR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "translator.py")
SUMMARIZER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "summarizer.py")

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


def detect_lang():
    """Return 2-letter language code from env ($LANG) or 'en'."""
    for var in ("LANG", "LC_ALL", "LC_MESSAGES"):
        val = os.environ.get(var, "")
        if val:
            code = val.split(".")[0].split("_")[0].lower()
            if code and code != "c":
                return code
    try:
        loc = _locale.getdefaultlocale()[0]
        if loc:
            return loc.split("_")[0].lower()
    except Exception:
        pass
    return "en"


def translation_settings(config):
    translate_enabled = True
    target_lang = None
    if config:
        if "translate" in config:
            translate_enabled = bool(config["translate"])
        target_lang = config.get("translateLang")
    if not target_lang:
        target_lang = detect_lang()
    # Skip if target is English (no translation needed)
    if target_lang == "en":
        translate_enabled = False
    return translate_enabled, target_lang


def cached_translation(title, target_lang):
    if not os.path.exists(TRANSLATION_CACHE):
        return None
    try:
        with open(TRANSLATION_CACHE) as f:
            cache = json.load(f)
        return cache.get(f"{target_lang}::{title}", {}).get("translation")
    except Exception:
        return None


def launch_translator(title, target_lang):
    """Spawn translator as background process. Non-blocking."""
    try:
        subprocess.Popen(
            ["python3", TRANSLATOR, target_lang, title],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            stdin=subprocess.DEVNULL,
            env=build_background_env(),
            start_new_session=True,
        )
    except Exception as e:
        log(f"translator launch failed: {e}")


def cached_summary(url, target_lang):
    if not os.path.exists(SUMMARY_CACHE):
        return None
    try:
        with open(SUMMARY_CACHE) as f:
            cache = json.load(f)
        return cache.get(f"{target_lang}::{url}", {}).get("summary")
    except Exception:
        return None


def launch_summarizer(url, title, target_lang):
    try:
        subprocess.Popen(
            ["python3", SUMMARIZER, target_lang, url, title],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            stdin=subprocess.DEVNULL,
            env=build_background_env(),
            start_new_session=True,
        )
    except Exception as e:
        log(f"summarizer launch failed: {e}")


def main():
    if os.environ.get(BACKGROUND_CHILD_ENV) == "1":
        pass_through()
        return

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
    original_title = pick.get("title", "")
    log(f"showing news: {original_title[:50]}")

    translate_enabled, target_lang = translation_settings(config)
    summary_lang = target_lang if translate_enabled else "en"
    url = pick.get("url", "")

    display_title = original_title
    if translate_enabled:
        cached = cached_translation(original_title, target_lang)
        if cached:
            display_title = cached
            log(f"using cached translation ({target_lang})")

    # Cached summary check (keyed by url + summary_lang)
    summary = cached_summary(url, summary_lang) if url else None

    # Write news item to file for statusline to render
    record = {
        "title": display_title,
        "url": url,
        "source": pick.get("source", ""),
        "score": pick.get("score"),
        "comments": pick.get("comments"),
        "timestamp": int(time.time() * 1000),
    }
    if summary:
        record["summary"] = summary
    if translate_enabled and display_title == original_title:
        record["original_title"] = original_title
    elif not translate_enabled:
        # Keep original for summarizer to match against even when no translation
        record["original_title"] = original_title

    with open(CURRENT_NEWS_FILE, "w") as f:
        json.dump(record, f, ensure_ascii=False)

    # Launch background translation if enabled and not yet cached
    if translate_enabled and display_title == original_title:
        launch_translator(original_title, target_lang)
        log(f"launched translator for {target_lang}")

    # Launch summarizer if URL present and no cached summary yet
    if url and not summary:
        launch_summarizer(url, original_title, summary_lang)
        log(f"launched summarizer ({summary_lang})")

    pass_through()


if __name__ == "__main__":
    main()
