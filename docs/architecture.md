# CLINIX Architecture

CLINIX is a lean, single-workflow clinical decision support demo with a multi-agent pipeline.

Backend
- FastAPI API exposes a single /api/analyze endpoint.
- Orchestrator runs the agents in order and returns a single response payload.
- LangChain is selected as the agent framework (currently using lightweight prompts with deterministic rules).

Frontend
- Next.js dashboard renders input, summary, risks, recommendations, and explainability.

Data
- Mock JSON patient notes only.
