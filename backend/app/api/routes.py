from fastapi import APIRouter
from app.core.snapshot import create_snapshot
from app.core.recovery import load_latest_snapshot
from app.models import CriticalData
from app.api import users, services, continuite, roles_api

router = APIRouter()
db = {}

router.include_router(users.router, tags=["Utilisateurs"])
router.include_router(services.router, tags=["Services"])
router.include_router(continuite.router, tags=["Continuité de service"])
router.include_router(roles_api.router, tags=["Rôles"])

@router.post("/snapshot")
def snapshot(data: dict):
    path = create_snapshot(data)
    return {"saved": path}

@router.get("/recover")
def recover():
    return load_latest_snapshot()

@router.post("/load-test-data")
def load_test_data():
    import json
    with open("app/test_data.json", "r") as f:
        data = json.load(f)
    for item in data:
        db[item["id"]] = item
