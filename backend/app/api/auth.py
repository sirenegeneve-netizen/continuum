import math
import secrets
import sys
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import config
from app.db.database import SessionLocal, UtilisateurDB, get_db
from app.deps import get_current_user, oauth2_scheme, role_de  # noqa: F401  (oauth2_scheme réexporté)
from app.models import ChangementMotDePasse
from app.roles import Role
from app.security import (
    creer_token,
    hasher_mot_de_passe,
    limiteur_compte,
    limiteur_ip,
    verifier_mot_de_passe,
)

router = APIRouter()

# Ancien mot de passe d'amorçage, publié dans le dépôt : à ne plus accepter nulle part.
ANCIEN_MOT_DE_PASSE_PAR_DEFAUT = "continuum2025"


def _alerte(message: str):
    print(f"\n{'=' * 70}\n[CONTINUUM] {message}\n{'=' * 70}\n", file=sys.stderr, flush=True)


def initialiser_admin():
    """Crée le premier super administrateur si besoin, sans mot de passe écrit dans le code."""
    db = SessionLocal()
    try:
        email = config.ADMIN_EMAIL
        mdp_env = config.ADMIN_PASSWORD
        if mdp_env and len(mdp_env) < config.MIN_PASSWORD_LENGTH:
            raise RuntimeError(
                f"ADMIN_PASSWORD doit contenir au moins {config.MIN_PASSWORD_LENGTH} caractères"
            )

        admin = db.query(UtilisateurDB).filter(UtilisateurDB.email == email).first()
        if not admin:
            mdp = mdp_env or secrets.token_urlsafe(12)
            db.add(UtilisateurDB(
                id=str(uuid.uuid4()),
                nom="Admin",
                prenom="Super",
                email=email,
                role=Role.SUPER_ADMIN.value,
                mot_de_passe_hash=hasher_mot_de_passe(mdp),
                actif=True,
            ))
            db.commit()
            if not mdp_env:
                _alerte(
                    "Compte administrateur créé.\n"
                    f"  Email        : {email}\n"
                    f"  Mot de passe : {mdp}\n"
                    "Notez-le maintenant : il ne sera plus affiché. "
                    "Changez-le dès la première connexion."
                )
        elif verifier_mot_de_passe(ANCIEN_MOT_DE_PASSE_PAR_DEFAUT, admin.mot_de_passe_hash):
            if mdp_env:
                admin.mot_de_passe_hash = hasher_mot_de_passe(mdp_env)
                db.commit()
                _alerte(
                    f"Le compte {email} utilisait l'ancien mot de passe par défaut, "
                    "publié dans le dépôt. Il a été remplacé par ADMIN_PASSWORD."
                )
            else:
                _alerte(
                    f"DANGER : le compte {email} utilise encore l'ancien mot de passe par "
                    "défaut, connu publiquement.\n"
                    "Définissez ADMIN_PASSWORD dans backend/.env puis redémarrez, "
                    "ou changez-le via POST /auth/change-password."
                )
    finally:
        db.close()


@router.post("/login")
def login(request: Request, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "inconnue"
    cle_compte = f"{ip}|{form.username.strip().lower()}"

    attente = max(limiteur_compte.secondes_restantes(cle_compte), limiteur_ip.secondes_restantes(ip))
    if attente:
        raise HTTPException(
            status_code=429,
            detail=f"Trop de tentatives de connexion. Réessayez dans {math.ceil(attente / 60)} minute(s).",
            headers={"Retry-After": str(attente)},
        )

    user = db.query(UtilisateurDB).filter(UtilisateurDB.email == form.username).first()
    if not user or not verifier_mot_de_passe(form.password, user.mot_de_passe_hash):
        limiteur_compte.echec(cle_compte)
        limiteur_ip.echec(ip)
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not user.actif:
        raise HTTPException(status_code=403, detail="Compte desactive")

    limiteur_compte.reussite(cle_compte)
    token = creer_token({"sub": user.email, "role": role_de(user)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "email": user.email,
        "nom": user.nom,
        "prenom": user.prenom,
        "role": role_de(user),
        "service_ids": [s.id for s in user.services],
    }


@router.post("/change-password")
def changer_mot_de_passe(
    data: ChangementMotDePasse,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verifier_mot_de_passe(data.ancien, user.mot_de_passe_hash):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    user.mot_de_passe_hash = hasher_mot_de_passe(data.nouveau)
    db.commit()
    return {"message": "Mot de passe modifié"}
