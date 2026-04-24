from enum import Enum
from pydantic import BaseModel


class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class User(BaseModel):
    user_id: str
    role: UserRole
    
    def has_role(self, required_role: UserRole) -> bool:
        # Admin can do everything
        if self.role == UserRole.ADMIN:
            return True
        # Role matching
        return self.role == required_role
    
    def can_access_patient(self, patient_id: str) -> bool:
        # Patients can only access their own records
        if self.role == UserRole.PATIENT:
            return self.user_id == patient_id
        # Doctors and admins can access any patient
        return self.role in [UserRole.DOCTOR, UserRole.ADMIN]