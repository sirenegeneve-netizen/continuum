from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from app.roles import Role
from app.config import MIN_PASSWORD_LENGTH


def _valider_mot_de_passe(valeur: str) -> str:
    if len(valeur) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Le mot de passe doit contenir au moins {MIN_PASSWORD_LENGTH} caractères")
    if len(valeur.encode("utf-8")) > 72:
        raise ValueError("Le mot de passe ne doit pas dépasser 72 octets")
    return valeur


class CriticalData(BaseModel):
    id: str
    name: str
    value: str
    source_system: str
    last_update: Optional[datetime] = None
    status: str = "active"

class ServiceBase(BaseModel):
    nom: str
    description: Optional[str] = None
    couleur: Optional[str] = "#3b82f6"

class ServiceCreation(ServiceBase):
    pass

class ServiceReponse(ServiceBase):
    id: int
    class Config:
        from_attributes = True

class Utilisateur(BaseModel):
    id: str
    nom: str
    prenom: str
    email: str
    role: Role
    organisation: Optional[str] = None
    actif: bool = True
    date_creation: Optional[datetime] = None
    service_ids: List[int] = []

class UtilisateurCreation(BaseModel):
    nom: str
    prenom: str
    email: str
    mot_de_passe: str
    role: Role
    organisation: Optional[str] = None
    actif: bool = True
    service_ids: List[int] = []

    @field_validator("mot_de_passe")
    @classmethod
    def mot_de_passe_valide(cls, v):
        return _valider_mot_de_passe(v)

class UtilisateurModification(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    role: Optional[Role] = None
    actif: Optional[bool] = None
    organisation: Optional[str] = None
    service_ids: Optional[List[int]] = None
    mot_de_passe: Optional[str] = None  # réinitialisation par un administrateur

    @field_validator("mot_de_passe")
    @classmethod
    def mot_de_passe_valide(cls, v):
        return None if v in (None, "") else _valider_mot_de_passe(v)

class ChangementMotDePasse(BaseModel):
    ancien: str
    nouveau: str

    @field_validator("nouveau")
    @classmethod
    def nouveau_valide(cls, v):
        return _valider_mot_de_passe(v)
