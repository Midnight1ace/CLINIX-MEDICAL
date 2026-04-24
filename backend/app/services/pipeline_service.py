from ..agents.orchestrator import run_pipeline
from ..models.response import AnalysisRequest, AnalysisResponse
from .llm_service import LLMService


class PipelineService:
    def __init__(self) -> None:
        self.llm = LLMService()

    def run(self, request: AnalysisRequest) -> AnalysisResponse:
        return run_pipeline(request.raw_text, self.llm)
