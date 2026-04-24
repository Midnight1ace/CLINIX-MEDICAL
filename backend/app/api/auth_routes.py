from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..utils.jwt import create_access_token
from ..utils.cookies import set_auth_cookies
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# Demo users - in a real app, these would come from a database
# Using plain text for demo due to bcrypt compatibility issues with Python 3.14
DEMO_PATIENTS = {
    "P001": {
        "patientId": "P001",
        "dob": "1980-01-01",
        "role": "patient"
    }
}

DEMO_DOCTORS = {
    "doctor@hospital.org": {
        "email": "doctor@hospital.org",
        "licenseId": "DOC-123456",
        "password": "demo1234",  # In real app, this would be hashed
        "role": "doctor"
    }
}

from pydantic import BaseModel

class PatientLoginRequest(BaseModel):
    patientId: str
    dob: str

class DoctorLoginRequest(BaseModel):
    email: str
    licenseId: str
    password: str

@router.post("/patient/login")
async def patient_login(request: PatientLoginRequest, response: Response):
    """Patient login using patientId and DOB"""
    # Normalize patientId like in frontend
    normalized_patient_id = request.patientId.strip().upper()
    
    # Check if patient exists
    patient = DEMO_PATIENTS.get(normalized_patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid patient ID or date of birth"
        )
    
    # Validate DOB
    if patient["dob"] != request.dob:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid patient ID or date of birth"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": patient["patientId"], "role": patient["role"]},
        expires_delta=access_token_expires
    )
    
    # Set cookie
    set_auth_cookies(response, access_token)
    
    return {"message": "Login successful", "role": patient["role"]}

@router.post("/doctor/login")
async def doctor_login(request: DoctorLoginRequest, response: Response):
    """Doctor login using email, license ID, and password"""
    # Normalize email
    normalized_email = request.email.strip().lower()
    
    # Check if doctor exists
    doctor = DEMO_DOCTORS.get(normalized_email)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Validate license ID
    if doctor["licenseId"] != request.licenseId.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Validate password (in real app, compare hashed password)
    if doctor["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": doctor["email"], "role": doctor["role"]},
        expires_delta=access_token_expires
    )
    
    # Set cookie
    set_auth_cookies(response, access_token)
    
    return {"message": "Login successful", "role": doctor["role"]}

@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing auth cookie"""
    from ..utils.cookies import clear_auth_cookies
    clear_auth_cookies(response)
    return {"message": "Logged out successfully"}