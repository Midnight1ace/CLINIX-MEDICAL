import re
from typing import List

from ..models.patient import PatientData, PatientVitals

SYMPTOM_KEYWORDS = [
    "chest pain",
    "shortness of breath",
    "fever",
    "cough",
    "dizziness",
    "headache",
    "nausea",
    "vomiting",
    "fatigue",
    "palpitations",
]

MEDICATION_KEYWORDS = [
    "aspirin",
    "ibuprofen",
    "acetaminophen",
    "metformin",
    "lisinopril",
    "atorvastatin",
    "amoxicillin",
    "albuterol",
]


def _find_first_int(pattern: str, text: str) -> int | None:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def _find_first_float(pattern: str, text: str) -> float | None:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def parse_raw_text(raw_text: str) -> PatientData:
    text = raw_text.lower()

    age = _find_first_int(r"(\d{1,3})\s*(?:yo|y/o|year[-\s]?old|years?\s*old)", text)

    bp_match = re.search(r"(\d{2,3})\s*/\s*(\d{2,3})", text)
    bp_systolic = int(bp_match.group(1)) if bp_match else None
    bp_diastolic = int(bp_match.group(2)) if bp_match else None

    heart_rate = _find_first_int(r"(?:hr|heart rate|pulse)\s*[:=]?\s*(\d{2,3})", text)

    temp = _find_first_float(r"(?:temp|temperature)\s*[:=]?\s*(\d{2}(?:\.\d)?)", text)
    if temp is not None and temp > 45:
        temp = round((temp - 32) * 5 / 9, 1)

    symptoms = [s for s in SYMPTOM_KEYWORDS if s in text]
    medications = [m for m in MEDICATION_KEYWORDS if m in text]

    vitals = PatientVitals(
        bp_systolic=bp_systolic,
        bp_diastolic=bp_diastolic,
        heart_rate=heart_rate,
        temperature_c=temp,
    )

    return PatientData(
        age=age,
        symptoms=symptoms,
        vitals=vitals,
        medications=medications,
        notes=raw_text.strip(),
    )
