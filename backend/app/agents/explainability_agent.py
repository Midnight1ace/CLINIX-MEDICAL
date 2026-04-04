from __future__ import annotations

from ..models.patient import PatientData
from ..models.risk import RiskItem
from ..services.llm_service import LLMService


def run_explainability(
    patient: PatientData,
    risks: list[RiskItem],
    recommendations: list[str],
    llm: LLMService,
) -> list[str]:
    explanations: list[str] = []

    for risk in risks:
        explanations.append(f"{risk.title}: {risk.rationale}")

    if any("ECG" in r for r in recommendations) and "chest pain" in patient.symptoms:
        explanations.append("Chest pain triggered ECG recommendation to rule out cardiac causes.")

    if any("blood pressure" in r.lower() for r in recommendations) and patient.vitals.bp_systolic:
        explanations.append(
            f"BP {patient.vitals.bp_systolic}/{patient.vitals.bp_diastolic} led to hypertension follow-up guidance."
        )

    if any("oxygen" in r.lower() for r in recommendations) and "shortness of breath" in patient.symptoms:
        explanations.append("Dyspnea prompted oxygen saturation check.")

    return explanations
