from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Boolean, JSON
from app.db.database import get_db, Base, engine
from pydantic import BaseModel
from typing import Optional
import uuid

class RoleDB(Base):
    __tablename__ = "roles_custom"
    id = Column(String, primary_key=True)
    nom = Column(String)
    description = Column(String, nullable=True)
    couleur = Column(String, default="#3b82f6")
    bg = Column(String, default="#dbeafe")
    systeme = Column(Boolean, default=False)
    permissions = Column(JSON, default={})

Base.metadata.create_all(bind=engine)

class RoleCreate(BaseModel):
    nom: str
    description: Optional[str] = ""
    couleur: Optional[str] = "#3b82f6"
    bg: Optional[str] = "#dbeafe"
    permissions: Optional[dict] = {}

router = APIRouter()

ROLES_SYSTEME = [
    { "id": "super_admin", "nom": "Super Administrateur", "couleur": "#a32d2d", "bg": "#fcebeb", "systeme": True, "description": "Accès complet à la plateforme", "permissions": {} },
    { "id": "admin_org", "nom": "Admin Organisation", "couleur": "#1d4ed8", "bg": "#dbeafe", "systeme": True, "description": "Responsable d'une entreprise cliente", "permissions": {} },
    { "id": "bcm", "nom": "Responsable BCM", "couleur": "#166534", "bg": "#dcfce7", "systeme": True, "description": "Création et gestion des plans PCA", "permissions": {} },
    { "id": "it", "nom": "Responsable IT", "couleur": "#7e22ce", "bg": "#f3e8ff", "systeme": True, "description": "Vision technique et gestion IT", "permissions": {} },
    { "id": "gestionnaire_crise", "nom": "Gestionnaire de crise", "couleur": "#856404", "bg": "#fef3cd", "systeme": True, "description": "Pilotage des incidents en temps réel", "permissions": {} },
    { "id": "contributeur", "nom": "Contributeur", "couleur": "#475569", "bg": "#f1f5f9", "systeme": True, "description": "Mise à jour des informations assignées", "permissions": {} },
    { "id": "auditeur", "nom": "Auditeur", "couleur": "#0369a1", "bg": "#e0f2fe", "systeme": True, "description": "Lecture seule — audits ISO 22301, NIS2, DORA", "permissions": {} },
]

@router.get("/roles")
def liste_roles(db: Session = Depends(get_db)):
    custom = db.query(RoleDB).all()
    custom_list = [{"id": r.id, "nom": r.nom, "description": r.description, "couleur": r.couleur, "bg": r.bg, "systeme": False, "permissions": r.permissions or {}} for r in custom]
    return ROLES_SYSTEME + custom_list

@router.post("/roles")
def creer_role(data: RoleCreate, db: Session = Depends(get_db)):
    role = RoleDB(
        id=str(uuid.uuid4()),
        nom=data.nom,
        description=data.description,
        couleur=data.couleur,
        bg=data.bg,
        systeme=False,
        permissions=data.permissions
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return {"id": role.id, "nom": role.nom, "description": role.description, "couleur": role.couleur, "bg": role.bg, "systeme": False, "permissions": role.permissions}

@router.put("/roles/{role_id}")
def modifier_role(role_id: str, data: RoleCreate, db: Session = Depends(get_db)):
    role = db.query(RoleDB).filter(RoleDB.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rôle introuvable")
    role.nom = data.nom
    role.description = data.description
    role.couleur = data.couleur
    role.bg = data.bg
    role.permissions = data.permissions
    db.commit()
    return {"id": role.id, "nom": role.nom, "description": role.description, "couleur": role.couleur, "bg": role.bg, "systeme": False, "permissions": role.permissions}

@router.delete("/roles/{role_id}")
def supprimer_role(role_id: str, db: Session = Depends(get_db)):
    role = db.query(RoleDB).filter(RoleDB.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rôle introuvable")
    db.delete(role)
    db.commit()
    return {"message": "Rôle supprimé"}
