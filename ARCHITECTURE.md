# System Architecture

## Agents

**Hermes (Brain — Orchestrator)**
- Plans and decomposes all tasks
- Holds memory across sessions
- Fires skills automatically
- Runs on cron every 10 minutes
- Posts structured status: What I Did / What's Left / What Needs Your Call

**OpenClaw (Hands — Coding Agent)**
- Receives tasks from Hermes via #agent-coder
- Writes, runs, and tests code
- Reports outcome back to channel
- Never acts without a task from Hermes

## Slack Channel Flow

Human → #sprint-main → Hermes plans
                      → #agent-coder → OpenClaw builds → reports back
                      → #agent-log  ← CI results + autonomous updates

## Model Routing
Hermes → Groq gpt-oss-120b (planning requires reasoning)
OpenClaw → Ollama qwen2.5-coder (code generation, unlimited)
Fallback: Groq → Gemini 2.5 Flash → OpenRouter :free → Ollama

## Self-Improvement Loop
CI fails → #agent-log → Hermes error-fix skill triggers
→ classifies error → assigns fix to OpenClaw
→ OpenClaw fixes → re-runs tests → logs outcome
→ skill updated for next occurrence

## CI/CD Quality Gate
Every commit → GitHub Actions → php artisan test
All 6 tests pass → Slack notification → human approves merge to main
Failing build → never reaches main branch
