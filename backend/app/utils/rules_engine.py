from __future__ import annotations

from ..core.constants import (
    AGE_ELDERLY,
    BP_DIASTOLIC_CRITICAL,
    BP_DIASTOLIC_HIGH,
    BP_SYSTOLIC_CRITICAL,
    BP_SYSTOLIC_HIGH,
    HR_HIGH,
    TEMP_FEVER_C,
)
from ..models.patient import PatientData
from ..models.risk import RiskItem


def detect_risks(patient: PatientData) -> list[RiskItem]:
    risks: list[RiskItem] = []

    sys_bp = patient.vitals.bp_systolic
    dia_bp = patient.vitals.bp_diastolic
    hr = patient.vitals.heart_rate
    temp = patient.vitals.temperature_c

    if sys_bp is not None and dia_bp is not None:
        if sys_bp >= BP_SYSTOLIC_CRITICAL or dia_bp >= BP_DIASTOLIC_CRITICAL:
            risks.append(
                RiskItem(
                    level="high",
                    title="Severely elevated blood pressure",
                    rationale=f"BP {sys_bp}/{dia_bp} exceeds critical threshold.",
                )
            )
        elif sys_bp >= BP_SYSTOLIC_HIGH or dia_bp >= BP_DIASTOLIC_HIGH:
            risks.append(
                RiskItem(
                    level="medium",
                    title="Elevated blood pressure",
                    rationale=f"BP {sys_bp}/{dia_bp} exceeds {BP_SYSTOLIC_HIGH}/{BP_DIASTOLIC_HIGH}.",
                )
            )

    if hr is not None and hr >= HR_HIGH:
        risks.append(
            RiskItem(
                level="medium",
                title="Tachycardia",
                rationale=f"Heart rate {hr} is above {HR_HIGH}.",
            )
        )

    if temp is not None and temp >= TEMP_FEVER_C:
        risks.append(
            RiskItem(
                level="medium",
                title="Fever",
                rationale=f"Temperature {temp}C is above {TEMP_FEVER_C}C.",
            )
        )

    symptom_text = " ".join(patient.symptoms)
    if "chest pain" in symptom_text:
        risks.append(
            RiskItem(
                level="high",
                title="Chest pain",
                rationale="Chest pain can indicate acute cardiac risk.",
            )
        )

    if "shortness of breath" in symptom_text:
        risks.append(
            RiskItem(
                level="high",
                title="Shortness of breath",
                rationale="Dyspnea is a high-priority respiratory/cardiac warning sign.",
            )
        )

    if patient.age is not None and patient.age >= AGE_ELDERLY:
        risks.append(
            RiskItem(
                level="low",
                title="Older age",
                rationale=f"Age {patient.age} increases baseline risk.",
            )
        )

    return risks
