from fastapi import APIRouter, Depends
from utils.jwt_auth import admin_required

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard", dependencies=[Depends(admin_required)])
def admin_dashboard():
    return {"message": "Welcome Admin"}
