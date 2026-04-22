#!/usr/bin/env python3
"""Live-updating news viewer. Runs in a separate tmux pane or terminal window.

Controls:
  Ctrl+C  quit
  q       quit (when input available)
  r       refresh now
"""

import json
import os
import locale as _locale
import select
import shutil
import subprocess
import sys
import termios
import time
import tty
import urllib.request

API_URL = "https://web-olive-three-47.vercel.app/api/news?limit=10"
CONFIG_DIR = os.path.expanduser("~/.code-earn")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
CURRENT_NEWS = os.path.join(CONFIG_DIR, ".current-news")
TRANSLATION_CACHE = os.path.join(CONFIG_DIR, ".translation-cache.json")
TRANSLATOR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hooks", "translator.py")
REFRESH_SEC = 30

CSI = "\x1b["
RESET = CSI + "0m"
BOLD = CSI + "1m"
DIM = CSI + "2m"
CYAN = CSI + "36m"
YELLOW = CSI + "33m"
GREEN = CSI + "32m"
GREY = CSI + "90m"
WHITE = CSI + "37m"


def clear():
    sys.stdout.write(CSI + "2J" + CSI + "H")


def term_cols():
    try:
        return shutil.get_terminal_size().columns
    except Exception:
        return 80


def fetch_news():
    try:
        req = urllib.request.Request(API_URL, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return {"error": str(e), "items": []}


def current_url():
    if not os.path.exists(CURRENT_NEWS):
        return None
    try:
        with open(CURRENT_NEWS) as f:
            return json.load(f).get("url")
    except Exception:
        return None


def load_translation_cache():
    if not os.path.exists(TRANSLATION_CACHE):
        return {}
    try:
        with open(TRANSLATION_CACHE) as f:
            return json.load(f)
    except Exception:
        return {}


def detect_lang():
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


def translation_settings():
    translate_enabled = True
    target_lang = None
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE) as f:
                cfg = json.load(f)
            if "translate" in cfg:
                translate_enabled = bool(cfg["translate"])
            target_lang = cfg.get("translateLang")
        except Exception:
            pass
    if not target_lang:
        target_lang = detect_lang()
    if target_lang == "en":
        translate_enabled = False
    return translate_enabled, target_lang


def apply_translations(items, target_lang, cache):
    """Replace each item's title with cached translation if available,
    otherwise launch background translator for missing ones."""
    missing = []
    for item in items:
        original = item.get("title", "")
        key = f"{target_lang}::{original}"
        entry = cache.get(key)
        if entry and entry.get("translation"):
            item["title"] = entry["translation"]
            item["_original_title"] = original
        else:
            missing.append(original)

    # Kick off background translations for missing titles (rate-limited)
    if os.path.exists(TRANSLATOR) and missing:
        for title in missing[:3]:  # max 3 concurrent to avoid spamming
            try:
                subprocess.Popen(
                    ["python3", TRANSLATOR, target_lang, title],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    stdin=subprocess.DEVNULL,
                    start_new_session=True,
                )
            except Exception:
                pass


def truncate(s, n):
    return s if len(s) <= n else s[: n - 1] + "…"


def supports_osc8():
    """Heuristic check for terminals known to render OSC 8 hyperlinks."""
    tp = os.environ.get("TERM_PROGRAM", "")
    term = os.environ.get("TERM", "")
    known = {"iTerm.app", "WezTerm", "vscode", "ghostty"}
    if tp in known:
        return True
    if "kitty" in term or os.environ.get("KITTY_WINDOW_ID"):
        return True
    if os.environ.get("ALACRITTY_SOCKET"):
        return True
    if os.environ.get("WEZTERM_EXECUTABLE"):
        return True
    # Apple Terminal started shipping OSC 8 support; gate by version if needed
    if tp == "Apple_Terminal":
        return True
    return False


def short_url(url):
    if not url:
        return ""
    try:
        from urllib.parse import urlparse
        p = urlparse(url)
        host = p.netloc.replace("www.", "")
        path = p.path or ""
        if len(path) > 30:
            path = path[:29] + "…"
        s = host + path
        return s if len(s) < 45 else s[:44] + "…"
    except Exception:
        return url[:40]


def render(data, current, cols):
    clear()
    header = f"{BOLD}{CYAN}  code-earn feed{RESET}  {DIM}refreshing every {REFRESH_SEC}s · Ctrl+C to quit · r to refresh{RESET}"
    print(header)
    print()

    if not data or data.get("error"):
        err = (data or {}).get("error", "no data")
        print(f"  {YELLOW}error:{RESET} {err}")
        return

    items = list(data.get("items", []) or [])
    if not items:
        print(f"  {DIM}no news available{RESET}")
        return

    translate_enabled, target_lang = translation_settings()
    if translate_enabled:
        cache = load_translation_cache()
        apply_translations(items, target_lang, cache)

    clickable = supports_osc8()
    # Reserve extra room for URL tail when links aren't clickable
    tail_w = 0 if clickable else 46
    title_w = max(20, cols - 40 - tail_w)

    for item in items:
        title = truncate(item.get("title", ""), title_w)
        source = item.get("source", "")
        score = item.get("score")
        url = item.get("url", "")
        comments = item.get("comments")

        marker = f"{GREEN}●{RESET}" if url == current else " "
        score_str = f" {YELLOW}▲{score}{RESET}" if score else ""
        comments_str = f" {GREY}💬{comments}{RESET}" if comments else ""

        # OSC 8 hyperlink around title (harmless if unsupported)
        linked_title = f"\x1b]8;;{url}\x07{WHITE}{title}{RESET}\x1b]8;;\x07" if url else f"{WHITE}{title}{RESET}"

        url_tail = ""
        if not clickable and url:
            url_tail = f"  {GREY}{short_url(url)}{RESET}"

        print(f"  {marker} {CYAN}{source:<15}{RESET} {linked_title}{score_str}{comments_str}{url_tail}")

    print()
    footer = f"{DIM}{GREEN}●{DIM} = currently displayed in status line{RESET}"
    if not clickable:
        footer += f"  {DIM}· URLs shown on right (cmd+click unsupported){RESET}"
    print(f"  {footer}")


def key_available(timeout):
    r, _, _ = select.select([sys.stdin], [], [], timeout)
    return bool(r)


def main():
    # Set stdin to cbreak so we can read single keys without Enter
    fd = sys.stdin.fileno()
    try:
        old = termios.tcgetattr(fd)
        tty.setcbreak(fd)
        interactive = True
    except Exception:
        interactive = False
        old = None

    try:
        data = fetch_news()
        last_fetch = time.time()
        render(data, current_url(), term_cols())

        while True:
            # Wait up to REFRESH_SEC for a key, then auto-refresh
            now = time.time()
            remaining = REFRESH_SEC - (now - last_fetch)
            if remaining <= 0:
                data = fetch_news()
                last_fetch = time.time()
                render(data, current_url(), term_cols())
                continue

            if interactive and key_available(min(remaining, 1.0)):
                ch = sys.stdin.read(1)
                if ch in ("q", "Q"):
                    break
                if ch in ("r", "R"):
                    data = fetch_news()
                    last_fetch = time.time()
                    render(data, current_url(), term_cols())
            else:
                # Tick: re-render every second to keep current marker fresh
                render(data, current_url(), term_cols())
                if not interactive:
                    time.sleep(1)
    finally:
        if interactive and old is not None:
            termios.tcsetattr(fd, termios.TCSADRAIN, old)
        print(RESET + "\n  bye")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(RESET + "\n  bye")
