"""Dépendances FastAPI partagées : utilisateur courant et contrôle des rôles."""
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import UtilisateurDB, get_db
from app.roles import ROLES_ADMIN_PLATEFORME
from app.security import verifier_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def role_de(user) -> str:
    return user.role.value if hasattr(user.role, "value") else user.role


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verifier_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(UtilisateurDB).filter(UtilisateurDB.email == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    if not user.actif:
        raise HTTPException(status_code=403, detail="Compte désactivé")
    return user


def exiger_roles(*roles):
    """Fabrique une dépendance qui n'accepte que les rôles indiqués."""
    autorises = {r.value if hasattr(r, "value") else r for r in roles}

    def verifier(user=Depends(get_current_user)):
        if role_de(user) not in autorises:
            raise HTTPException(status_code=403, detail="Accès refusé : droits insuffisants")
        return user

    return verifier


exiger_admin_plateforme = exiger_roles(*ROLES_ADMIN_PLATEFORME)
