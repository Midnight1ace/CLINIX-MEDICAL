from pydantic import BaseModel, Field, validator
from typing import Optional, List

from ..utils.sanitize import SanitizerMixin


class PatientVitals(BaseModel, SanitizerMixin):
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    temperature_c: Optional[float] = None
    
    @validator('bp_systolic', 'bp_diastolic', 'heart_rate', pre=True)
    def sanitize_numeric_fields(cls, v):
        # For numeric fields, just return as-is if they're valid numbers
        return v
    
    @validator('temperature_c', pre=True)
    def sanitize_temperature(cls, v):
        # For temperature, just return as-is if it's a valid number
        return v


class PatientData(BaseModel, SanitizerMixin):
    age: Optional[int] = None
    symptoms: List[str] = Field(default_factory=list)
    vitals: PatientVitals = Field(default_factory=PatientVitals)
    medications: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    
    @validator('age', pre=True)
    def sanitize_age(cls, v):
        return v
    
    @validator('symptoms', 'medications', pre=True)
    def sanitize_string_lists(cls, v):
        if isinstance(v, list):
            return [cls.sanitize_fields({'item': item})['item'] if isinstance(item, str) else item for item in v]
        return v
    
    @validator('notes', pre=True)
    def sanitize_notes(cls, v):
        return cls.sanitize_fields({'notes': v})['notes'] if isinstance(v, str) else v
