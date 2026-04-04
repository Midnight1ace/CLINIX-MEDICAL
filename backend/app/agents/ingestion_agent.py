from __future__ import annotations

from ..models.patient import PatientData
from ..services.llm_service import LLMService
from ..utils.parser import parse_raw_text


def run_ingestion(raw_text: str, llm: LLMService) -> PatientData:
    # Deterministic parsing first. LLM can be integrated later to fill gaps.
    return parse_raw_text(raw_text)
