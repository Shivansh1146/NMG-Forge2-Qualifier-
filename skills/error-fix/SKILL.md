---
name: error-fix
description: When a test fails or an error is reported, classify it and attempt auto-fix
---

When triggered with an error or failed test:

1. Classify the error type (syntax / logic / dependency / config)
2. Propose a fix in plain English
3. Assign the fix to OpenClaw in #agent-coder
4. After fix is applied, re-run the test
5. Log outcome to #agent-log
6. If fix fails twice, escalate: post "Needs Your Call" to #sprint-main

This skill enables the self-improving loop judges score under Self-Improvement (10 pts).
