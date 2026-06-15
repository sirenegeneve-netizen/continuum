from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, UtilisateurDB, ServiceDB
from app.models import UtilisateurCreation, UtilisateurModification
from app.security import hasher_mot_de_passe
from app.roles import Role
import uuid

router = APIRouter()

def formater_user(user):
    return {
        "id": user.id,
        "nom": user.nom,
        "prenom": user.prenom,
        "email": user.email,
        "role": user.role,
        "organisation": user.organisation,
        "actif": user.actif,
        "date_creation": user.date_creation,
        "service_ids": [s.id for s in user.services]
    }

@router.get("/users")
def liste_utilisateurs(db: Session = Depends(get_db)):
    users = db.query(UtilisateurDB).all()
    return [formater_user(u) for u in users]

@router.post("/users")
def creer_utilisateur(data: UtilisateurCreation, db: Session = Depends(get_db)):
    existant = db.query(UtilisateurDB).filter(UtilisateurDB.email == data.email).first()
    if existant:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = UtilisateurDB(
        id=str(uuid.uuid4()),
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        role=data.role,
        mot_de_passe_hash=hasher_mot_de_passe(data.mot_de_passe),
        organisation=data.organisation,
        actif=data.actif
    )

    if data.service_ids:
        services = db.query(ServiceDB).filter(ServiceDB.id.in_(data.service_ids)).all()
        user.services = services

    db.add(user)
    db.commit()
    db.refresh(user)
    return formater_user(user)

@router.put("/users/{user_id}")
def modifier_utilisateur(user_id: str, data: UtilisateurModification, db: Session = Depends(get_db)):
    user = db.query(UtilisateurDB).filter(UtilisateurDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if data.nom is not None: user.nom = data.nom
    if data.prenom is not None: user.prenom = data.prenom
    if data.email is not None: user.email = data.email
    if data.role is not None: user.role = data.role
    if data.actif is not None: user.actif = data.actif
    if data.organisation is not None: user.organisation = data.organisation

    if data.service_ids is not None:
        services = db.query(ServiceDB).filter(ServiceDB.id.in_(data.service_ids)).all()
        user.services = services

    db.commit()
    db.refresh(user)
    return formater_user(user)

@router.delete("/users/{user_id}")
def supprimer_utilisateur(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UtilisateurDB).filter(UtilisateurDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    db.delete(user)
    db.commit()
    return {"message": "Utilisateur supprimé"}
