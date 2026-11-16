from fastapi import APIRouter, Depends
from app.core.snapshot import create_snapshot
from app.core.recovery import load_latest_snapshot
from app.deps import get_current_user, exiger_admin_plateforme
from app.api import users, services, continuite, roles_api

router = APIRouter()
db = {}

# Toutes les routes de ces modules exigent un utilisateur authentifié (filet de sécurité :
# chaque route peut en plus imposer un rôle précis).
AUTHENTIFIE = [Depends(get_current_user)]

router.include_router(users.router, tags=["Utilisateurs"], dependencies=AUTHENTIFIE)
router.include_router(services.router, tags=["Services"], dependencies=AUTHENTIFIE)
router.include_router(continuite.router, tags=["Continuité de service"], dependencies=AUTHENTIFIE)
router.include_router(roles_api.router, tags=["Rôles"], dependencies=AUTHENTIFIE)

@router.post("/snapshot")
def snapshot(data: dict, user=Depends(exiger_admin_plateforme)):
    path = create_snapshot(data)
    return {"saved": path}

@router.get("/recover")
def recover(user=Depends(exiger_admin_plateforme)):
    return load_latest_snapshot()

@router.post("/load-test-data")
def load_test_data(user=Depends(exiger_admin_plateforme)):
    import json
    with open("app/test_data.json", "r") as f:
        data = json.load(f)
    for item in data:
        db[item["id"]] = item
    return {"loaded": len(data)}
