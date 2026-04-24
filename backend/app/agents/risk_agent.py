from typing import List

from ..models.patient import PatientData
from ..models.risk import RiskItem
from ..services.llm_service import LLMService
from ..utils.rules_engine import detect_risks


def run_risk_detection(patient: PatientData, llm: LLMService) -> List[RiskItem]:
    # Hybrid approach: rules first, LLM additions can be appended later.
    return detect_risks(patient)
