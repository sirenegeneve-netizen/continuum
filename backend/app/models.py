from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.roles import Role

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

class UtilisateurModification(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    role: Optional[Role] = None
    actif: Optional[bool] = None
    organisation: Optional[str] = None
    service_ids: Optional[List[int]] = None
