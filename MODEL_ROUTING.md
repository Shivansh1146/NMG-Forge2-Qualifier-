# Model Routing Configuration

The architecture enforces a strict two-agent system mapped to specific Large Language Models (LLMs) to maximize efficiency, speed, and logical capabilities based on the unique strengths of each model.

## Hermes (Planning & Orchestration)
- **Model:** Groq `openai/gpt-oss-120b` (or equivalent high-reasoning model)
- **Reason:** This is the strongest free/fast model available. It efficiently handles task decomposition, contextual memory integration, and strategic orchestration. The low latency enables real-time sprint status reporting and agile adjustments.

## OpenClaw (Coding & Execution)
- **Model:** Ollama `qwen2.5-coder`
- **Reason:** As the "hands" of the operation, OpenClaw requires unlimited iterations. Local execution is ideal to avoid API rate limits. `qwen2.5-coder` is specifically pre-trained and optimized for code generation, syntax accuracy, and debugging iterations.

## Fallback Ladder
In the event of an API outage or local resource exhaustion, the orchestration system follows a strict fallback ladder to guarantee zero downtime:
1. **Primary**: Groq (Fastest Planning)
2. **Fallback 1**: Gemini 2.5 Flash (Fast context window processing)
3. **Fallback 2**: OpenRouter `:free` tier models (High availability)
4. **Fallback 3**: Ollama (Local offline execution guarantees absolute fallback)

This routing logic guarantees that complex reasoning isn't blocked by token costs and code-generation isn't blocked by API downtime.
