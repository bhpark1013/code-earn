#!/usr/bin/env python3
"""Show a text ad in the terminal when user submits a prompt."""

import json
import os
import sys
import time
import urllib.request
import uuid

CONFIG_DIR = os.path.expanduser("~/.code-earn")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
LAST_OPEN_FILE = os.path.join(CONFIG_DIR, ".last_open")
SESSION_FILE = os.path.join(CONFIG_DIR, ".current_session")
START_FILE = os.path.join(CONFIG_DIR, ".session_start")

def load_config():
    if not os.path.exists(CONFIG_FILE):
        return None
    with open(CONFIG_FILE) as f:
        return json.load(f)

def is_rate_limited():
    if not os.path.exists(LAST_OPEN_FILE):
        return False
    with open(LAST_OPEN_FILE) as f:
        last = float(f.read().strip())
    return (time.time() - last) < 90

def save_timestamp():
    with open(LAST_OPEN_FILE, "w") as f:
        f.write(str(time.time()))

def fetch_ad(api_url, user_id, session_id):
    try:
        url = f"{api_url}/api/ad?uid={user_id}&sid={session_id}"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=3) as resp:
            return json.loads(resp.read())
    except Exception:
        return None

def main():
    # Read stdin (hook input)
    try:
        json.load(sys.stdin)
    except Exception:
        pass

    config = load_config()
    if not config or not config.get("enabled"):
        print(json.dumps({}))
        return

    user_id = config.get("userId", "")
    api_url = config.get("apiUrl", "https://web-olive-three-47.vercel.app")

    if not user_id or is_rate_limited():
        print(json.dumps({}))
        return

    save_timestamp()

    session_id = str(uuid.uuid4())
    with open(SESSION_FILE, "w") as f:
        f.write(session_id)
    with open(START_FILE, "w") as f:
        f.write(str(time.time()))

    # Fetch ad from server
    ad = fetch_ad(api_url, user_id, session_id)

    if ad:
        sponsor = ad.get("sponsor", "code-earn")
        desc = ad.get("description", "")
        ad_url = ad.get("url", "")
        ad_page = f"{api_url}/ad?uid={user_id}&sid={session_id}"

        lines = [
            "",
            f"  --- sponsored by {sponsor} ---",
            f"  {desc}",
        ]
        if ad_url:
            lines.append(f"  {ad_url}")
        lines.append("")
        lines.append(f"  + earn more: {ad_page}")
        lines.append("  -------------------------")
        lines.append("")

        msg = "\n".join(lines)
    else:
        msg = ""

    output = {}
    if msg:
        output["systemMessage"] = msg

    print(json.dumps(output))

if __name__ == "__main__":
    main()
