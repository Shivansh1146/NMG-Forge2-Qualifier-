<div align="center">

# 🚀 NMG Forge2 Qualifier

**Autonomous AI Agent Orchestration (Hermes & OpenClaw) via Slack**<br>
*Building a High-Performance Kanban Board with Laravel & React*

[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue?logo=react&style=for-the-badge)](https://forge2-frontend.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Laravel%20%7C%20PHP-red?logo=laravel&style=for-the-badge)](#)
[![Agents](https://img.shields.io/badge/Agents-Hermes%20%26%20OpenClaw-FF9900?logo=probot&style=for-the-badge)](#)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&style=for-the-badge)](#)

[Live Application Demo](https://forge2-frontend.vercel.app/) • [Watch the Loom Presentation](https://www.loom.com/share/131aedf3ad934bd5afc6b056facdbcd7)

</div>

---

## 📖 Project Overview

This repository is my official submission for the **NMG Forge2 Qualifier**. It demonstrates a complex integration of traditional full-stack web development and cutting-edge **Autonomous AI Orchestration**. 

Instead of writing code manually, I built a dual-agent system that communicates via **Slack**, taking high-level human requirements, generating architectural plans, executing the code, and deploying the results automatically.

### 🧠 The Dual-Agent System

This project is powered by two distinct AI personas routed through the high-performance **EastRouter API**:

* 🏛️ **Hermes (The Architect)**
  * **Model**: `z-ai/glm-5.1` (Strong reasoning & planning)
  * **Role**: Ingests human prompts from Slack, decomposes tasks, analyzes risks, and delegates structured execution plans.
* 🛠️ **OpenClaw (The Coder)**
  * **Model**: `moonshotai/kimi-k2.7-code` (Specialized code generation)
  * **Role**: Receives technical plans from Hermes, writes production-ready code, and initiates the automated GitHub CI/CD pipeline.

---

## ✨ Core Features

### 1. The Autonomous Pipeline
- **Slack Socket Mode Integration**: Real-time communication between the Human, Hermes, and OpenClaw in dedicated Slack channels (`#sprint-main`, `#agent-coder`, `#agent-log`).
- **Zero-Touch Deployments**: OpenClaw securely writes files locally, commits them autonomously, and pushes to remote, triggering GitHub Actions.
- **Resilient Execution**: Enforced strict timeout boundaries to guarantee zero downtime or lockups during API inference.

### 2. The Application (Kanban Board)
- **Dynamic Board Management**: Intuitive *To Do*, *Doing*, and *Done* columns with live badge tracking.
- **Card Lifecycle**: Full CRUD capabilities via an interactive, accessible modal.
- **Seamless Movement**: HTML5 native drag-and-drop combined with accessible arrow-button fallbacks.
- **Advanced Filtering**: Stackable, real-time filtering by text search, label, and assignee.
- **Audit Trails**: Real-time activity history logging per card (e.g., `just now`, `yesterday`).

---

## 🛠 Tech Stack

| Domain | Technologies |
|:---|:---|
| **Backend API** | Laravel 11, PHP 8.2, SQLite, REST API, PHPUnit |
| **Frontend UI** | React 18, Vite, Axios, Vanilla CSS (Modern Glassmorphism) |
| **Agent Orchestrator**| Node.js, Slack Bolt SDK, Axios |
| **AI Models** | GLM-5.1 (Planning), Kimi-K2.7-Code (Execution) via EastRouter |
| **DevOps & Hosting** | GitHub Actions, Render (Docker API), Vercel (Frontend) |

---

## 📂 Hackathon Evidence & Artifacts

All required hackathon evidence proving the authenticity of the autonomous agent loop is included in this repository:

1. **Slack Screenshots**: Found in the `slack-export/` directory, showing real-time agent conversations.
2. **Agent Logs**: View the compiled execution history in [agent-log.md](./agent-log.md).
3. **Architecture Diagrams**: Detailed breakdown available in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🚀 Getting Started Locally

Want to run the entire system on your machine? Follow these steps:

### 1. Backend (Laravel API)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
*The API will be available at `http://localhost:8000`.*

### 2. Frontend (React UI)
```bash
cd frontend
npm install
npm run dev
```
*The UI will be available at `http://localhost:5173`.*

### 3. Agent Orchestrator (Node.js)
```bash
cd orchestrator
npm install
# Ensure you have your .env file populated with Slack and EastRouter tokens
npm start
```
*The bot will connect to your workspace via Slack Socket Mode.*

---

<div align="center">
  <i>Built with precision for the NMG Forge2 Qualifier.</i>
</div>
