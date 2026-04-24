# Agents

Multi-agent system implementing the clinical reasoning pipeline.

## Agents

- **IngestionAgent** - Parses raw clinical text into structured PatientData
- **SummaryAgent** - Generates human-readable clinical summary
- **RiskAgent** - Identifies risks using rules engine and LLM
- **RecommendationAgent** - Suggests clinical next steps
- **ExplainabilityAgent** - Provides traceability and reasoning

## Orchestrator

The `Orchestrator` class coordinates agents:
```python
from app.agents.orchestrator import Orchestrator

orchestrator = Orchestrator()
result = await orchestrator.run(raw_text)
```

Runs agents in sequence, passing context between them.

## Extending

To add a new agent:
1. Create agent class inheriting from `BaseAgent`
2. Implement `process()` method
3. Register in orchestrator
4. Update analysis schema if needed
