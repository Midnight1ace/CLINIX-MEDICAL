from ..models.response import AnalysisResponse
from ..services.llm_service import LLMService
from .explainability_agent import run_explainability
from .ingestion_agent import run_ingestion
from .recommendation_agent import run_recommendations
from .risk_agent import run_risk_detection
from .summary_agent import run_summary


PIPELINE_STEPS = [
    "Ingestion Agent",
    "Clinical Summary Agent",
    "Risk Detection Agent",
    "Recommendation Agent",
    "Explainability Agent",
]


def run_pipeline(raw_text: str, llm: LLMService) -> AnalysisResponse:
    patient = run_ingestion(raw_text, llm)
    summary = run_summary(patient, llm)
    risks = run_risk_detection(patient, llm)
    recommendations = run_recommendations(patient, risks, llm)
    explainability = run_explainability(patient, risks, recommendations, llm)

    return AnalysisResponse(
        steps=PIPELINE_STEPS,
        structured=patient,
        summary=summary,
        risks=risks,
        recommendations=recommendations,
        explainability=explainability,
    )
