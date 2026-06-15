from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db, ConnecteurDB, EnregistrementDB, ModificationDB, CommentaireDB, UtilisateurDB, ServiceDB
from app.api.auth import oauth2_scheme
from app.security import verifier_token
from app.roles import ROLES_ADMIN
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json, csv, io

router = APIRouter()

# ── HELPERS ─────────────────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verifier_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = db.query(UtilisateurDB).filter(UtilisateurDB.email == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user

def est_admin(user: UtilisateurDB):
    return user.role in [r.value for r in ROLES_ADMIN]

def services_accessibles(user: UtilisateurDB, db: Session):
    if est_admin(user):
        return [s.id for s in db.query(ServiceDB).all()]
    return [s.id for s in user.services]

def formater_connecteur(c):
    return {
        "id": c.id,
        "nom": c.nom,
        "type": c.type,
        "description": c.description,
        "service_id": c.service_id,
        "champs": c.champs or [],
        "mode_import": c.mode_import,
        "actif": c.actif,
        "date_creation": c.date_creation,
        "nb_enregistrements": len(c.enregistrements)
    }

def formater_enregistrement(e):
    return {
        "id": e.id,
        "connecteur_id": e.connecteur_id,
        "donnees": e.donnees or {},
        "date_import": e.date_import,
        "importe_par": e.importe_par,
        "nb_modifications": len(e.modifications),
        "nb_commentaires": len(e.commentaires)
    }

# ── MODELES ─────────────────────────────────────────────────────────

class ConnecteurCreation(BaseModel):
    nom: str
    type: str
    description: Optional[str] = None
    service_id: Optional[int] = None
    champs: List[dict]
    mode_import: Optional[str] = "fichier"

class ModificationChamp(BaseModel):
    champ: str
    valeur: str

class CommentaireCreation(BaseModel):
    texte: str

class EnregistrementManuel(BaseModel):
    donnees: dict

# ── CONNECTEURS ─────────────────────────────────────────────────────

@router.get("/connecteurs")
def liste_connecteurs(db: Session = Depends(get_db), user=Depends(get_current_user)):
    svc_ids = services_accessibles(user, db)
    connecteurs = db.query(ConnecteurDB).filter(ConnecteurDB.actif == True).all()
    result = []
    for c in connecteurs:
        if c.service_id is None or c.service_id in svc_ids:
            result.append(formater_connecteur(c))
    return result

@router.post("/connecteurs")
def creer_connecteur(data: ConnecteurCreation, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not est_admin(user):
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    c = ConnecteurDB(
        nom=data.nom,
        type=data.type,
        description=data.description,
        service_id=data.service_id,
        champs=data.champs,
        mode_import=data.mode_import
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return formater_connecteur(c)

@router.put("/connecteurs/{connecteur_id}")
def modifier_connecteur(connecteur_id: int, data: ConnecteurCreation, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not est_admin(user):
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    c = db.query(ConnecteurDB).filter(ConnecteurDB.id == connecteur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Connecteur introuvable")
    c.nom = data.nom
    c.type = data.type
    c.description = data.description
    c.service_id = data.service_id
    c.champs = data.champs
    c.mode_import = data.mode_import
    db.commit()
    db.refresh(c)
    return formater_connecteur(c)

@router.delete("/connecteurs/{connecteur_id}")
def supprimer_connecteur(connecteur_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not est_admin(user):
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    c = db.query(ConnecteurDB).filter(ConnecteurDB.id == connecteur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Connecteur introuvable")
    db.delete(c)
    db.commit()
    return {"message": "Connecteur supprimé"}

# ── IMPORT ──────────────────────────────────────────────────────────

@router.post("/connecteurs/{connecteur_id}/importer-fichier")
async def importer_fichier(
    connecteur_id: int,
    fichier: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not est_admin(user):
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    c = db.query(ConnecteurDB).filter(ConnecteurDB.id == connecteur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Connecteur introuvable")

    contenu = await fichier.read()
    enregistrements_crees = 0

    try:
        if fichier.filename.endswith(".json"):
            lignes = json.loads(contenu)
            if isinstance(lignes, dict):
                lignes = [lignes]
        elif fichier.filename.endswith(".csv"):
            texte = contenu.decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(texte))
            lignes = [dict(row) for row in reader]
        else:
            raise HTTPException(status_code=400, detail="Format non supporté. Utilisez CSV ou JSON.")

        champs_ids = [ch["id"] for ch in (c.champs or [])]

        for ligne in lignes:
            donnees = {}
            for cid in champs_ids:
                donnees[cid] = str(ligne.get(cid, ligne.get(cid.upper(), "")))
            e = EnregistrementDB(
                connecteur_id=connecteur_id,
                donnees=donnees,
                importe_par=f"{user.prenom} {user.nom}"
            )
            db.add(e)
            enregistrements_crees += 1

        db.commit()
        return {"message": f"{enregistrements_crees} enregistrement(s) importé(s)"}

    except Exception as ex:
        raise HTTPException(status_code=400, detail=f"Erreur import : {str(ex)}")

@router.post("/connecteurs/{connecteur_id}/importer-manuel")
def importer_manuel(
    connecteur_id: int,
    data: EnregistrementManuel,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not est_admin(user):
        raise HTTPException(status_code=403, detail="Réservé aux administrateurs")
    c = db.query(ConnecteurDB).filter(ConnecteurDB.id == connecteur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Connecteur introuvable")
    e = EnregistrementDB(
        connecteur_id=connecteur_id,
        donnees=data.donnees,
        importe_par=f"{user.prenom} {user.nom}"
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return formater_enregistrement(e)

# ── ENREGISTREMENTS ─────────────────────────────────────────────────

@router.get("/connecteurs/{connecteur_id}/enregistrements")
def liste_enregistrements(connecteur_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    c = db.query(ConnecteurDB).filter(ConnecteurDB.id == connecteur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Connecteur introuvable")
    svc_ids = services_accessibles(user, db)
    if c.service_id and c.service_id not in svc_ids:
        raise HTTPException(status_code=403, detail="Accès refusé")
    enregistrements = db.query(EnregistrementDB).filter(EnregistrementDB.connecteur_id == connecteur_id).all()
    return [formater_enregistrement(e) for e in enregistrements]

@router.put("/enregistrements/{enregistrement_id}/champ")
def modifier_champ(
    enregistrement_id: int,
    data: ModificationChamp,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    e = db.query(EnregistrementDB).filter(EnregistrementDB.id == enregistrement_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enregistrement introuvable")
    svc_ids = services_accessibles(user, db)
    c = e.connecteur
    if c.service_id and c.service_id not in svc_ids:
        raise HTTPException(status_code=403, detail="Accès refusé")
    valeur_avant = (e.donnees or {}).get(data.champ, "")
    nouvelles_donnees = dict(e.donnees or {})
    nouvelles_donnees[data.champ] = data.valeur
    e.donnees = nouvelles_donnees

    modif = ModificationDB(
        enregistrement_id=enregistrement_id,
        champ=data.champ,
        valeur_avant=valeur_avant,
        valeur_apres=data.valeur,
        modifie_par=user.email,
        modifie_par_nom=f"{user.prenom} {user.nom}"
    )
    db.add(modif)
    db.commit()
    return {"message": "Champ mis à jour"}

@router.get("/enregistrements/{enregistrement_id}/historique")
def historique_enregistrement(enregistrement_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    e = db.query(EnregistrementDB).filter(EnregistrementDB.id == enregistrement_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enregistrement introuvable")
    modifications = sorted(e.modifications, key=lambda m: m.date_modification, reverse=True)
    return [{
        "id": m.id,
        "champ": m.champ,
        "valeur_avant": m.valeur_avant,
        "valeur_apres": m.valeur_apres,
        "modifie_par_nom": m.modifie_par_nom,
        "date": m.date_modification
    } for m in modifications]

# ── COMMENTAIRES ────────────────────────────────────────────────────

@router.get("/enregistrements/{enregistrement_id}/commentaires")
def liste_commentaires(enregistrement_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    e = db.query(EnregistrementDB).filter(EnregistrementDB.id == enregistrement_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enregistrement introuvable")
    return [{
        "id": c.id,
        "texte": c.texte,
        "auteur_nom": c.auteur_nom,
        "date": c.date
    } for c in sorted(e.commentaires, key=lambda x: x.date, reverse=True)]

@router.post("/enregistrements/{enregistrement_id}/commentaires")
def ajouter_commentaire(
    enregistrement_id: int,
    data: CommentaireCreation,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    e = db.query(EnregistrementDB).filter(EnregistrementDB.id == enregistrement_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Enregistrement introuvable")
    c = CommentaireDB(
        enregistrement_id=enregistrement_id,
        texte=data.texte,
        auteur=user.email,
        auteur_nom=f"{user.prenom} {user.nom}"
    )
    db.add(c)
    db.commit()
    return {"message": "Commentaire ajouté"}

# ── EXPORT RÉINTÉGRATION ────────────────────────────────────────────

@router.get("/connecteurs/{connecteur_id}/exporter")
def exporter_connecteur(connecteur_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    c = db.query(ConnecteurDB).filter(ConnecteurDB.id == connecteur_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Connecteur introuvable")
    enregistrements = db.query(EnregistrementDB).filter(EnregistrementDB.connecteur_id == connecteur_id).all()
    export = []
    for e in enregistrements:
        ligne = dict(e.donnees or {})
        ligne["_date_import"] = str(e.date_import)
        ligne["_importe_par"] = e.importe_par
        ligne["_nb_modifications"] = len(e.modifications)
        ligne["_commentaires"] = " | ".join([f"{cm.auteur_nom}: {cm.texte}" for cm in e.commentaires])
        export.append(ligne)
    return export
