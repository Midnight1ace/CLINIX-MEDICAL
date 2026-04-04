from __future__ import annotations

from pydantic import BaseModel, Field


class PatientVitals(BaseModel):
    bp_systolic: int | None = None
    bp_diastolic: int | None = None
    heart_rate: int | None = None
    temperature_c: float | None = None


class PatientData(BaseModel):
    age: int | None = None
    symptoms: list[str] = Field(default_factory=list)
    vitals: PatientVitals = Field(default_factory=PatientVitals)
    medications: list[str] = Field(default_factory=list)
    notes: str | None = None
