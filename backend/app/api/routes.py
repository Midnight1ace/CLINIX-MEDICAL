from fastapi import APIRouter, Depends, HTTPException

from ..models.response import AnalysisRequest, AnalysisResponse
from ..services.pipeline_service import PipelineService
from ..middleware.auth import authenticated, TokenData
from ..middleware.authorization import require_doctor_or_admin, require_patient, require_admin, get_current_user
from ..models.auth import User

router = APIRouter()
_pipeline = PipelineService()


@router.post("/analyze", response_model=AnalysisResponse)
def analyze(
    payload: AnalysisRequest, 
    user: User = Depends(require_doctor_or_admin())
) -> AnalysisResponse:
    return _pipeline.run(payload)


@router.get("/patient/profile")
def get_patient_profile(user: User = Depends(require_patient())):
    return {"message": f"Patient profile for {user.user_id}", "role": user.role}


@router.get("/admin/stats")
def get_admin_stats(user: User = Depends(require_admin())):
    return {"message": "Admin stats", "role": user.role}
