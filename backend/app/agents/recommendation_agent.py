from typing import List

from ..models.patient import PatientData
from ..models.risk import RiskItem
from ..services.llm_service import LLMService


def run_recommendations(
    patient: PatientData, risks: List[RiskItem], llm: LLMService
) -> List[str]:
    recs: List[str] = []
    risk_titles = {r.title.lower() for r in risks}
    symptoms = {s.lower() for s in patient.symptoms}

    if "chest pain" in symptoms or "chest pain" in risk_titles:
        recs.extend(
            [
                "Obtain ECG and cardiac biomarkers.",
                "Assess for acute coronary syndrome and consider ER evaluation.",
            ]
        )

    if any("blood pressure" in r.title.lower() for r in risks):
        recs.append("Recheck blood pressure and evaluate for hypertension management.")

    if any("tachycardia" in r.title.lower() for r in risks):
        recs.append("Assess for causes of tachycardia (pain, fever, dehydration).")

    if any("fever" in r.title.lower() for r in risks):
        recs.append("Consider infection workup and hydration guidance.")

    if "shortness of breath" in symptoms:
        recs.append("Check oxygen saturation and consider chest imaging.")

    if not recs:
        recs.append("Monitor symptoms and schedule follow-up in 24-48 hours.")

    return recs
