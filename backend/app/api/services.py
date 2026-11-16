from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, ServiceDB
from app.models import ServiceCreation
from app.deps import get_current_user, exiger_admin_plateforme

router = APIRouter()

def formater_service(s):
    return {
        "id": s.id,
        "nom": s.nom,
        "description": s.description,
        "couleur": s.couleur
    }

@router.get("/services")
def liste_services(db: Session = Depends(get_db), user=Depends(get_current_user)):
    services = db.query(ServiceDB).all()
    return [formater_service(s) for s in services]

@router.post("/services")
def creer_service(data: ServiceCreation, db: Session = Depends(get_db), user=Depends(exiger_admin_plateforme)):
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
def modifier_service(service_id: int, data: ServiceCreation, db: Session = Depends(get_db), user=Depends(exiger_admin_plateforme)):
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
def supprimer_service(service_id: int, db: Session = Depends(get_db), user=Depends(exiger_admin_plateforme)):
    service = db.query(ServiceDB).filter(ServiceDB.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service introuvable")
    db.delete(service)
    db.commit()
    return {"message": "Service supprimé"}
