from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.security import verifier_mot_de_passe, hasher_mot_de_passe, creer_token, verifier_token
from app.db.database import get_db, UtilisateurDB, creer_tables
from app.roles import Role
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.on_event("startup")
def startup():
    creer_tables()
    from app.db.database import SessionLocal
    db = SessionLocal()
    admin = db.query(UtilisateurDB).filter(UtilisateurDB.email == "admin@continuum.fr").first()
    if not admin:
        db.add(UtilisateurDB(
            id=str(uuid.uuid4()),
            nom="Admin",
            prenom="Super",
            email="admin@continuum.fr",
            role=Role.SUPER_ADMIN,
            mot_de_passe_hash=hasher_mot_de_passe("continuum2025"),
            actif=True
        ))
        db.commit()
    db.close()

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UtilisateurDB).filter(UtilisateurDB.email == form.username).first()
    if not user or not verifier_mot_de_passe(form.password, user.mot_de_passe_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not user.actif:
        raise HTTPException(status_code=403, detail="Compte desactive")
    token = creer_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verifier_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(UtilisateurDB).filter(UtilisateurDB.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return {
        "email": user.email,
        "nom": user.nom,
        "prenom": user.prenom,
        "role": user.role,
        "service_ids": [s.id for s in user.services]
    }
