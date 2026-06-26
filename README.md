# 🚀 NMG Forge2 Qualifier — Made by Shivansh

[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue?logo=react&style=flat-square)](https://forge2-frontend.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Laravel%20%7C%20PHP-red?logo=laravel&style=flat-square)](#)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&style=flat-square)](#)
[![Agent Orchestration](https://img.shields.io/badge/Agents-Hermes%20%2B%20OpenClaw-FF9900?style=flat-square)](#)

> **Live Application Demo:** [https://forge2-frontend.vercel.app/](https://forge2-frontend.vercel.app/)
> **Loom Video Demo:** [Watch the Demo](https://www.loom.com/share/131aedf3ad934bd5afc6b056facdbcd7)

## 📖 What It Does
A high-performance, Trello-style Kanban board autonomously engineered by a dual-agent AI system (**Hermes** and **OpenClaw**) coordinating transparently through a simulated Slack environment.

---

## ✨ Core Features
- **Dynamic Board**: Intuitive *To Do*, *Doing*, and *Done* columns with live badge tracking.
- **Card Management**: Full CRUD capabilities (Create, Edit, Delete) via an interactive modal.
- **Seamless Movement**: Both HTML5 native drag-and-drop and accessible arrow-button fallbacks.
- **Audit Trails**: Real-time activity history logging per card (with relative timestamps like `just now` and `yesterday`).
- **Advanced Filtering**: Stackable real-time filtering by text search, label, and assignee.
- **Deadline Visuals**: Overdue date highlighting and exact color-coded labels.
- **CI/CD Quality Gates**: Automated testing pipeline with integrated Slack notifications ensuring zero-failing commits.

---

## 🛠 Tech Stack
| Domain | Technologies |
|---|---|
| **Backend** | Laravel, PHP 8.2, SQLite, REST API, PHPUnit |
| **Frontend** | React, Vite, Axios, Vanilla CSS |
| **Agent Roles** | Hermes (Brain/Orchestration), OpenClaw (Hands/Execution) |
| **Comms** | Simulated Slack Environment |
| **DevOps** | GitHub Actions, Render (Docker), Vercel |

---

## 🧠 Model Routing Strategy
This project strictly enforces specialized LLM routing for efficiency, cost-reduction, and accuracy:

* **Hermes (Planning)** → `Groq (openai/gpt-oss-120b)`
  * *Why:* It's the strongest free/fast model available, enabling complex task decomposition, long-term memory management, and zero-bottleneck status reporting.
* **OpenClaw (Coding)** → `Ollama (qwen2.5-coder)`
  * *Why:* As the executing agent, unlimited local calls are required. This model is purpose-built and specifically fine-tuned for code generation and bug fixing without hitting API limits.

**Fallback Ladder:**  
`Groq` → `Gemini 2.5 Flash` → `OpenRouter :free` → `Ollama`

---

## 🚀 Run Locally

### 1. Backend (API)
```bash
cd backend
composer install
php artisan migrate --seed
php artisan serve
```

### 2. Frontend (UI)
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Agent Loop Evidence & Architecture
*Hermes and OpenClaw were configured but the Slack loop evidence is incomplete. The Kanban application is fully functional.*

To review the system architecture, please explore the following documentation:
- 🏗 **[System Architecture (`ARCHITECTURE.md`)](./ARCHITECTURE.md)**
- 📜 **[Agent Logs (`agent-log.md`)](./agent-log.md)**
