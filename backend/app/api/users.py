from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, UtilisateurDB, ServiceDB
from app.models import UtilisateurCreation, UtilisateurModification
from app.security import hasher_mot_de_passe
from app.roles import Role
from app.deps import exiger_admin_plateforme, role_de
import uuid

router = APIRouter()

SUPER = Role.SUPER_ADMIN.value


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


def verifier_droit_sur_role(acteur, role_cible: str):
    """Seul un super administrateur peut créer, modifier ou supprimer un super administrateur."""
    if role_cible == SUPER and role_de(acteur) != SUPER:
        raise HTTPException(
            status_code=403,
            detail="Seul un super administrateur peut gérer un compte super administrateur"
        )


def est_dernier_super_admin_actif(db: Session, user) -> bool:
    if role_de(user) != SUPER or not user.actif:
        return False
    autres = db.query(UtilisateurDB).filter(
        UtilisateurDB.role == SUPER,
        UtilisateurDB.actif == True,
        UtilisateurDB.id != user.id,
    ).count()
    return autres == 0


@router.get("/users")
def liste_utilisateurs(db: Session = Depends(get_db), acteur=Depends(exiger_admin_plateforme)):
    users = db.query(UtilisateurDB).all()
    return [formater_user(u) for u in users]


@router.post("/users")
def creer_utilisateur(data: UtilisateurCreation, db: Session = Depends(get_db), acteur=Depends(exiger_admin_plateforme)):
    verifier_droit_sur_role(acteur, data.role.value)

    existant = db.query(UtilisateurDB).filter(UtilisateurDB.email == data.email).first()
    if existant:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = UtilisateurDB(
        id=str(uuid.uuid4()),
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        role=data.role.value,
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
def modifier_utilisateur(user_id: str, data: UtilisateurModification, db: Session = Depends(get_db), acteur=Depends(exiger_admin_plateforme)):
    user = db.query(UtilisateurDB).filter(UtilisateurDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Le compte visé, et le rôle demandé, doivent être gérables par l'acteur
    verifier_droit_sur_role(acteur, role_de(user))
    if data.role is not None:
        verifier_droit_sur_role(acteur, data.role.value)

    if user.id == acteur.id:
        if data.role is not None and data.role.value != role_de(user):
            raise HTTPException(status_code=400, detail="Vous ne pouvez pas modifier votre propre rôle")
        if data.actif is False:
            raise HTTPException(status_code=400, detail="Vous ne pouvez pas désactiver votre propre compte")

    perd_super_admin = (data.role is not None and data.role.value != SUPER) or data.actif is False
    if perd_super_admin and est_dernier_super_admin_actif(db, user):
        raise HTTPException(status_code=400, detail="Impossible : c'est le dernier super administrateur actif")

    if data.email is not None and data.email != user.email:
        if db.query(UtilisateurDB).filter(UtilisateurDB.email == data.email).first():
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
        user.email = data.email

    if data.nom is not None: user.nom = data.nom
    if data.prenom is not None: user.prenom = data.prenom
    if data.role is not None: user.role = data.role.value
    if data.actif is not None: user.actif = data.actif
    if data.organisation is not None: user.organisation = data.organisation
    if data.mot_de_passe: user.mot_de_passe_hash = hasher_mot_de_passe(data.mot_de_passe)

    if data.service_ids is not None:
        services = db.query(ServiceDB).filter(ServiceDB.id.in_(data.service_ids)).all()
        user.services = services

    db.commit()
    db.refresh(user)
    return formater_user(user)


@router.delete("/users/{user_id}")
def supprimer_utilisateur(user_id: str, db: Session = Depends(get_db), acteur=Depends(exiger_admin_plateforme)):
    user = db.query(UtilisateurDB).filter(UtilisateurDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if user.id == acteur.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    verifier_droit_sur_role(acteur, role_de(user))
    if est_dernier_super_admin_actif(db, user):
        raise HTTPException(status_code=400, detail="Impossible : c'est le dernier super administrateur actif")

    db.delete(user)
    db.commit()
    return {"message": "Utilisateur supprimé"}
