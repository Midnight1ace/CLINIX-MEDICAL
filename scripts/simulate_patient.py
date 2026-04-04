from __future__ import annotations

import random

SYMPTOMS = [
    "chest pain",
    "shortness of breath",
    "fever",
    "cough",
    "dizziness",
    "headache",
    "nausea",
]
MEDS = ["aspirin", "ibuprofen", "metformin", "lisinopril", "atorvastatin"]


def simulate_patient() -> str:
    age = random.randint(20, 85)
    symptoms = ", ".join(random.sample(SYMPTOMS, k=2))
    bp_sys = random.randint(110, 180)
    bp_dia = random.randint(70, 110)
    hr = random.randint(60, 120)
    temp = round(random.uniform(36.5, 39.5), 1)
    meds = ", ".join(random.sample(MEDS, k=2))

    return (
        f"{age}-year-old patient with {symptoms}. "
        f"BP {bp_sys}/{bp_dia}, HR {hr}, temp {temp}. "
        f"Taking {meds}."
    )


if __name__ == "__main__":
    print(simulate_patient())
