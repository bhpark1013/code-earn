#!/usr/bin/env python3
"""Live-updating news viewer. Runs in a separate tmux pane or terminal window.

Controls:
  Ctrl+C  quit
  q       quit (when input available)
  r       refresh now
"""

import json
import os
import select
import shutil
import sys
import termios
import time
import tty
import urllib.request

API_URL = "https://web-olive-three-47.vercel.app/api/news?limit=10"
CURRENT_NEWS = os.path.expanduser("~/.code-earn/.current-news")
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


def truncate(s, n):
    return s if len(s) <= n else s[: n - 1] + "…"


def render(data, current, cols):
    clear()
    header = f"{BOLD}{CYAN}  code-earn feed{RESET}  {DIM}refreshing every {REFRESH_SEC}s · Ctrl+C to quit · r to refresh{RESET}"
    print(header)
    print()

    if not data or data.get("error"):
        err = (data or {}).get("error", "no data")
        print(f"  {YELLOW}error:{RESET} {err}")
        return

    items = data.get("items", [])
    if not items:
        print(f"  {DIM}no news available{RESET}")
        return

    # Title column = total - source(~14) - score(~10) - marker(2) - padding
    title_w = max(20, cols - 40)

    for item in items:
        title = truncate(item.get("title", ""), title_w)
        source = item.get("source", "")
        score = item.get("score")
        url = item.get("url", "")
        comments = item.get("comments")

        marker = f"{GREEN}●{RESET}" if url == current else " "
        score_str = f" {YELLOW}▲{score}{RESET}" if score else ""
        comments_str = f" {GREY}💬{comments}{RESET}" if comments else ""

        # OSC 8 hyperlink around title
        linked_title = f"\x1b]8;;{url}\x07{WHITE}{title}{RESET}\x1b]8;;\x07" if url else f"{WHITE}{title}{RESET}"
        print(f"  {marker} {CYAN}{source:<15}{RESET} {linked_title}{score_str}{comments_str}")

    print()
    print(f"  {DIM}{GREEN}●{DIM} = currently displayed in status line{RESET}")


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
