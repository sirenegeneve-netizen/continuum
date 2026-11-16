import os
import tempfile

# Configuration de test : AVANT tout import de l'application.
_DOSSIER = tempfile.mkdtemp(prefix="continuum-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{_DOSSIER}/test.db"
os.environ["SECRET_KEY"] = "cle-de-test-" + "x" * 40
os.environ["ADMIN_EMAIL"] = "admin@test.fr"
os.environ["ADMIN_PASSWORD"] = "MotDePasseAdmin42"

import uuid

import pytest
from fastapi.testclient import TestClient

from app.db.database import SessionLocal, UtilisateurDB
from main import app  # noqa: E402
from app.security import hasher_mot_de_passe, limiteur_compte, limiteur_ip

ADMIN = ("admin@test.fr", "MotDePasseAdmin42")
MDP = "MotDePasseTest42"


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _reset_limiteurs():
    limiteur_compte.reinitialiser()
    limiteur_ip.reinitialiser()
    yield


def se_connecter(client, email, mdp):
    r = client.post("/auth/login", data={"username": email, "password": mdp})
    return r


def en_tete(client, email, mdp):
    r = se_connecter(client, email, mdp)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def creer_compte(role: str, actif: bool = True):
    """Crée un compte directement en base et retourne (email, mot_de_passe, id)."""
    email = f"{role}-{uuid.uuid4().hex[:8]}@test.fr"
    db = SessionLocal()
    try:
        u = UtilisateurDB(
            id=str(uuid.uuid4()), nom="Test", prenom=role, email=email, role=role,
            mot_de_passe_hash=hasher_mot_de_passe(MDP), actif=actif,
        )
        db.add(u)
        db.commit()
        return email, MDP, u.id
    finally:
        db.close()


@pytest.fixture()
def admin_h(client):
    return en_tete(client, *ADMIN)
