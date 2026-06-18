from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, ServiceDB, UtilisateurDB
from app.models import ServiceCreation
from app.security import verifier_token
from app.roles import ROLES_ADMIN_PLATEFORME
from app.api.auth import oauth2_scheme

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verifier_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(UtilisateurDB).filter(UtilisateurDB.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user

def exiger_admin_plateforme(user):
    role_val = user.role.value if hasattr(user.role, "value") else user.role
    if role_val not in [r.value for r in ROLES_ADMIN_PLATEFORME]:
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs de la plateforme")

def formater_service(s):
    return {
        "id": s.id,
        "nom": s.nom,
        "description": s.description,
        "couleur": s.couleur
    }

@router.get("/services")
def liste_services(db: Session = Depends(get_db)):
    services = db.query(ServiceDB).all()
    return [formater_service(s) for s in services]

@router.post("/services")
def creer_service(data: ServiceCreation, db: Session = Depends(get_db), user=Depends(get_current_user)):
    exiger_admin_plateforme(user)
    existant = db.query(ServiceDB).filter(ServiceDB.nom == data.nom).first()
    if existant:
        raise HTTPException(status_code=400, detail="Un service avec ce nom existe déjà")
    service = ServiceDB(
        nom=data.nom,
        description=data.description,
        couleur=data.couleur or "#3b82f6"
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return formater_service(service)

@router.put("/services/{service_id}")
def modifier_service(service_id: int, data: ServiceCreation, db: Session = Depends(get_db), user=Depends(get_current_user)):
    exiger_admin_plateforme(user)
    service = db.query(ServiceDB).filter(ServiceDB.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service introuvable")
    service.nom = data.nom
    service.description = data.description
    service.couleur = data.couleur or service.couleur
    db.commit()
    db.refresh(service)
    return formater_service(service)

@router.delete("/services/{service_id}")
def supprimer_service(service_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    exiger_admin_plateforme(user)
    service = db.query(ServiceDB).filter(ServiceDB.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service introuvable")
    db.delete(service)
    db.commit()
    return {"message": "Service supprimé"}
