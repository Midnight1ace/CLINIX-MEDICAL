from __future__ import annotations

from pydantic import BaseModel, Field

from .patient import PatientData
from .risk import RiskItem


class AnalysisRequest(BaseModel):
    raw_text: str = Field(..., min_length=1)


class AnalysisResponse(BaseModel):
    steps: list[str]
    structured: PatientData
    summary: str
    risks: list[RiskItem]
    recommendations: list[str]
    explainability: list[str]
