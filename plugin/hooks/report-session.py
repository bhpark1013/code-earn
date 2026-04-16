#!/usr/bin/env python3
"""Report ad session duration when agent stops."""

import json
import os
import sys
import time
import urllib.request

CONFIG_DIR = os.path.expanduser("~/.code-earn")
CONFIG_FILE = os.path.join(CONFIG_DIR, "config.json")
SESSION_FILE = os.path.join(CONFIG_DIR, ".current_session")
START_FILE = os.path.join(CONFIG_DIR, ".session_start")

def main():
    # Read stdin (hook input)
    try:
        json.load(sys.stdin)
    except Exception:
        pass

    if not os.path.exists(CONFIG_FILE):
        print(json.dumps({}))
        return

    with open(CONFIG_FILE) as f:
        config = json.load(f)

    if not config.get("enabled"):
        print(json.dumps({}))
        return

    if not os.path.exists(SESSION_FILE) or not os.path.exists(START_FILE):
        print(json.dumps({}))
        return

    with open(SESSION_FILE) as f:
        session_id = f.read().strip()
    with open(START_FILE) as f:
        start_time = float(f.read().strip())

    duration = int(time.time() - start_time)
    user_id = config.get("userId", "")
    api_url = config.get("apiUrl", "https://web-olive-three-47.vercel.app")

    # Report session
    try:
        data = json.dumps({
            "userId": user_id,
            "sessionId": session_id,
            "duration": duration,
        }).encode()
        req = urllib.request.Request(
            f"{api_url}/api/session",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=3)
    except Exception:
        pass

    # Cleanup
    for f in [SESSION_FILE, START_FILE]:
        try:
            os.remove(f)
        except OSError:
            pass

    print(json.dumps({}))

if __name__ == "__main__":
    main()
