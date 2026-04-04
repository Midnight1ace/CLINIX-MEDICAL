from fastapi import APIRouter

from ..models.response import AnalysisRequest, AnalysisResponse
from ..services.pipeline_service import PipelineService

router = APIRouter()
_pipeline = PipelineService()


@router.post("/analyze", response_model=AnalysisResponse)
def analyze(payload: AnalysisRequest) -> AnalysisResponse:
    return _pipeline.run(payload)
