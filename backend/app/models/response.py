from pydantic import BaseModel, Field, validator
from typing import List

from .patient import PatientData
from .risk import RiskItem
from ..utils.sanitize import SanitizerMixin


class AnalysisRequest(BaseModel, SanitizerMixin):
    raw_text: str = Field(..., min_length=1)
    
    @validator('raw_text', pre=True)
    def sanitize_raw_text(cls, v):
        return cls.sanitize_fields({'raw_text': v})['raw_text'] if isinstance(v, str) else v

class AnalysisResponse(BaseModel):
    steps: List[str]
    structured: PatientData
    summary: str
    risks: List[RiskItem]
    recommendations: List[str]
    explainability: List[str]
