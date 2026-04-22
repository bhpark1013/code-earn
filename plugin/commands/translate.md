---
description: Toggle news title auto-translation (uses your Claude Code session, no API key)
argument-hint: "[on | off | ko | ja | en | ...]"
allowed-tools: Bash(bash:*)
---

Control news title translation.

- `/code-earn:translate` — toggle on/off
- `/code-earn:translate on` — enable
- `/code-earn:translate off` — disable
- `/code-earn:translate ko` (or `ja`, `zh`, `es`, etc.) — enable + set target language

Raw slash-command arguments: `$ARGUMENTS`

```bash
bash ${CLAUDE_PLUGIN_ROOT}/commands/translate.sh $ARGUMENTS
```

Report the script output verbatim.
