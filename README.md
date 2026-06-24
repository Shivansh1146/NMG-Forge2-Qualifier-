# NMG Forge2 Qualifier — Antigravity

## What It Does
Trello-style Kanban board built by a two-agent system
(Hermes + OpenClaw) coordinating through Slack.

## Features
- Board with To Do / Doing / Done columns
- Card CRUD (create, edit, delete)
- Drag & drop + arrow button card movement
- Activity history per card with relative timestamps
- Search + filter by label and assignee
- Due dates with overdue highlighting
- CI/CD pipeline with auto Slack notifications

## Tech Stack
Backend: Laravel, SQLite, REST API, PHPUnit
Frontend: React, Vite, Axios
Agents: Hermes (brain), OpenClaw (hands)
Comms: Slack
CI/CD: GitHub Actions

## Model Routing
Hermes (planning) → Groq openai/gpt-oss-120b
  Why: strongest free model for decomposition and memory
OpenClaw (coding) → Ollama qwen2.5-coder
  Why: unlimited local calls, purpose-built for code

Fallback: Groq → Gemini 2.5 Flash → Ollama

## Run Locally
cd backend && php artisan serve
cd frontend && npm run dev

## Live URL
https://forge2-frontend.vercel.app/

## Agent Loop Evidence
See agent-log.md and slack-export/ folder
