# Orchestrator

This is the Node.js orchestration service for the dual-agent AI system (Hermes and OpenClaw). It connects to Slack via Socket Mode and serves as the communication bridge.

## Setup

1. Navigate to the `orchestrator/` directory:
   ```bash
   cd orchestrator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Slack tokens:
   ```bash
   cp .env.example .env
   ```
   * `SLACK_BOT_TOKEN`: Your bot user OAuth token (starts with `xoxb-`).
   * `SLACK_APP_TOKEN`: Your app-level token with `connections:write` scope (starts with `xapp-`).
   * `SPRINT_MAIN_CHANNEL_ID`: The Channel ID for `#sprint-main` so the bot can exclusively listen there.

## Running the Service

For development (auto-reloads on file changes):
```bash
npm run dev
```

For standard execution:
```bash
npm start
```

## Features
- Connects to Slack using robust Socket Mode.
- Exclusively listens for human messages in the `#sprint-main` channel.
- Automatically ignores bot-generated messages to prevent loops.
- Provides structured logging (terminal output + file logging in `logs/orchestrator.log`).
