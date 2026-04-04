from __future__ import annotations

from ..models.patient import PatientData
from ..services.llm_service import LLMService


def run_summary(patient: PatientData, llm: LLMService) -> str:
    parts: list[str] = []

    if patient.age is not None:
        parts.append(f"{patient.age}-year-old patient.")

    if patient.symptoms:
        parts.append(f"Symptoms: {', '.join(patient.symptoms)}.")

    vitals = patient.vitals
    vitals_bits: list[str] = []
    if vitals.bp_systolic is not None and vitals.bp_diastolic is not None:
        vitals_bits.append(f"BP {vitals.bp_systolic}/{vitals.bp_diastolic}")
    if vitals.heart_rate is not None:
        vitals_bits.append(f"HR {vitals.heart_rate}")
    if vitals.temperature_c is not None:
        vitals_bits.append(f"Temp {vitals.temperature_c}C")
    if vitals_bits:
        parts.append("Vitals: " + ", ".join(vitals_bits) + ".")

    if patient.medications:
        parts.append(f"Medications: {', '.join(patient.medications)}.")

    return " ".join(parts) if parts else "No structured data extracted yet."
