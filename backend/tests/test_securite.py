import os
import uuid

import pytest

import main
from conftest import ADMIN, MDP, creer_compte, en_tete, se_connecter

ROUTES_PROTEGEES = [
    ("GET", "/api/users"),
    ("POST", "/api/users"),
    ("PUT", "/api/users/x"),
    ("DELETE", "/api/users/x"),
    ("GET", "/api/roles"),
    ("POST", "/api/roles"),
    ("PUT", "/api/roles/x"),
    ("DELETE", "/api/roles/x"),
    ("GET", "/api/services"),
    ("POST", "/api/services"),
    ("PUT", "/api/services/1"),
    ("DELETE", "/api/services/1"),
    ("POST", "/api/snapshot"),
    ("GET", "/api/recover"),
    ("POST", "/api/load-test-data"),
    ("GET", "/api/connecteurs"),
    ("POST", "/api/connecteurs"),
    ("GET", "/api/connecteurs/1/enregistrements"),
    ("GET", "/api/connecteurs/1/exporter"),
    ("PUT", "/api/enregistrements/1/champ"),
    ("GET", "/auth/me"),
    ("POST", "/auth/change-password"),
]


# ── Authentification obligatoire ────────────────────────────────────

@pytest.mark.parametrize("methode,chemin", ROUTES_PROTEGEES)
def test_route_refuse_anonyme(client, methode, chemin):
    r = client.request(methode, chemin, json={})
    assert r.status_code == 401, f"{methode} {chemin} -> {r.status_code}"


@pytest.mark.parametrize("methode,chemin", ROUTES_PROTEGEES)
def test_route_refuse_token_invalide(client, methode, chemin):
    r = client.request(methode, chemin, json={}, headers={"Authorization": "Bearer pas.un.token"})
    assert r.status_code == 401, f"{methode} {chemin} -> {r.status_code}"


def test_api_status_reste_public(client):
    assert client.get("/api-status").status_code == 200


# ── Connexion ───────────────────────────────────────────────────────

def test_login_ok(client):
    r = se_connecter(client, *ADMIN)
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"


def test_login_mauvais_mot_de_passe(client):
    assert se_connecter(client, ADMIN[0], "mauvais").status_code == 401


def test_login_ancien_mot_de_passe_par_defaut_refuse(client):
    assert se_connecter(client, "admin@continuum.fr", "continuum2025").status_code == 401


def test_compte_desactive_ne_peut_pas_se_connecter(client):
    email, mdp, _ = creer_compte("contributeur", actif=False)
    assert se_connecter(client, email, mdp).status_code == 403


def test_token_d_un_compte_desactive_est_refuse(client, admin_h):
    email, mdp, uid = creer_compte("contributeur")
    h = en_tete(client, email, mdp)
    assert client.get("/auth/me", headers=h).status_code == 200
    r = client.put(f"/api/users/{uid}", json={"actif": False}, headers=admin_h)
    assert r.status_code == 200
    assert client.get("/auth/me", headers=h).status_code == 403


def test_limitation_des_tentatives(client):
    email = f"cible-{uuid.uuid4().hex[:6]}@test.fr"
    for _ in range(5):
        assert se_connecter(client, email, "faux").status_code == 401
    r = se_connecter(client, email, "faux")
    assert r.status_code == 429
    assert "Retry-After" in r.headers


def test_changement_de_mot_de_passe(client):
    email, mdp, _ = creer_compte("contributeur")
    h = en_tete(client, email, mdp)
    assert client.post("/auth/change-password", json={"ancien": "faux", "nouveau": "NouveauMdp123"}, headers=h).status_code == 400
    assert client.post("/auth/change-password", json={"ancien": mdp, "nouveau": "court"}, headers=h).status_code == 422
    assert client.post("/auth/change-password", json={"ancien": mdp, "nouveau": "NouveauMdp123"}, headers=h).status_code == 200
    assert se_connecter(client, email, mdp).status_code == 401
    assert se_connecter(client, email, "NouveauMdp123").status_code == 200


# ── Droits par rôle ─────────────────────────────────────────────────

@pytest.mark.parametrize("role", ["contributeur", "auditeur", "bcm", "it", "gestionnaire_crise"])
def test_roles_non_admin_exclus_de_l_administration(client, role):
    email, mdp, _ = creer_compte(role)
    h = en_tete(client, email, mdp)
    assert client.get("/api/users", headers=h).status_code == 403
    assert client.post("/api/roles", json={"nom": "x"}, headers=h).status_code == 403
    assert client.post("/api/services", json={"nom": f"s-{uuid.uuid4().hex[:6]}"}, headers=h).status_code == 403
    assert client.post("/api/snapshot", json={}, headers=h).status_code == 403
    assert client.get("/api/recover", headers=h).status_code == 403
    # En revanche ils peuvent lire les listes de référence
    assert client.get("/api/roles", headers=h).status_code == 200
    assert client.get("/api/services", headers=h).status_code == 200


def test_export_selon_permission_exports(client):
    email, mdp, _ = creer_compte("contributeur")
    h = en_tete(client, email, mdp)
    assert client.get("/api/connecteurs/1/exporter", headers=h).status_code == 403
    email, mdp, _ = creer_compte("auditeur")
    h = en_tete(client, email, mdp)
    # autorisé par le rôle : on arrive jusqu'à la recherche du connecteur (inexistant)
    assert client.get("/api/connecteurs/999999/exporter", headers=h).status_code == 404


# ── Escalade de privilèges et garde-fous ────────────────────────────

def nouveau_user(role="contributeur", mdp=MDP):
    return {
        "nom": "N", "prenom": "P", "email": f"n-{uuid.uuid4().hex[:8]}@test.fr",
        "mot_de_passe": mdp, "role": role,
    }


def test_admin_org_ne_peut_pas_creer_de_super_admin(client):
    email, mdp, _ = creer_compte("admin_org")
    h = en_tete(client, email, mdp)
    assert client.post("/api/users", json=nouveau_user("super_admin"), headers=h).status_code == 403
    assert client.post("/api/users", json=nouveau_user("contributeur"), headers=h).status_code == 200


def test_admin_org_ne_peut_pas_se_promouvoir_ni_toucher_un_super_admin(client, admin_h):
    email, mdp, uid = creer_compte("admin_org")
    h = en_tete(client, email, mdp)
    assert client.put(f"/api/users/{uid}", json={"role": "super_admin"}, headers=h).status_code in (400, 403)
    r = client.get("/api/users", headers=admin_h)
    super_id = next(u["id"] for u in r.json() if u["email"] == ADMIN[0])
    assert client.put(f"/api/users/{super_id}", json={"nom": "Pirate"}, headers=h).status_code == 403
    assert client.delete(f"/api/users/{super_id}", headers=h).status_code == 403


def test_super_admin_peut_creer_un_super_admin(client, admin_h):
    assert client.post("/api/users", json=nouveau_user("super_admin"), headers=admin_h).status_code == 200


def test_mot_de_passe_trop_court_refuse(client, admin_h):
    assert client.post("/api/users", json=nouveau_user(mdp="court"), headers=admin_h).status_code == 422


def test_on_ne_peut_pas_supprimer_son_propre_compte(client, admin_h):
    me = client.get("/auth/me", headers=admin_h).json()
    users = client.get("/api/users", headers=admin_h).json()
    mon_id = next(u["id"] for u in users if u["email"] == me["email"])
    assert client.delete(f"/api/users/{mon_id}", headers=admin_h).status_code == 400
    assert client.put(f"/api/users/{mon_id}", json={"actif": False}, headers=admin_h).status_code == 400
    assert client.put(f"/api/users/{mon_id}", json={"role": "contributeur"}, headers=admin_h).status_code == 400


def test_regle_du_dernier_super_admin():
    """Règle de sécurité : le dernier super administrateur actif ne doit jamais disparaître."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.api.users import est_dernier_super_admin_actif
    from app.db.database import Base, UtilisateurDB

    engine = create_engine("sqlite://")  # base isolée en mémoire
    Base.metadata.create_all(engine)
    db = sessionmaker(bind=engine)()

    def ajouter(role, actif=True):
        u = UtilisateurDB(id=str(uuid.uuid4()), nom="n", prenom="p", email=f"{uuid.uuid4().hex}@t.fr",
                          role=role, mot_de_passe_hash="x", actif=actif)
        db.add(u)
        db.commit()
        return u

    seul = ajouter("super_admin")
    assert est_dernier_super_admin_actif(db, seul) is True

    autre = ajouter("super_admin")
    assert est_dernier_super_admin_actif(db, seul) is False  # il en reste un autre

    autre.actif = False
    db.commit()
    assert est_dernier_super_admin_actif(db, seul) is True  # l'autre est inactif : seul compte

    assert est_dernier_super_admin_actif(db, ajouter("contributeur")) is False


# ── Fichiers statiques : pas d'évasion hors du dossier dist ─────────

def test_fichier_dans_dist_bloque_les_remontees(tmp_path, monkeypatch):
    dist = tmp_path / "dist"
    dist.mkdir()
    (dist / "index.html").write_text("ok")
    (tmp_path / "secret.db").write_text("secret")
    monkeypatch.setattr(main, "FRONTEND_DIR", os.path.realpath(dist))

    assert main.fichier_dans_dist("index.html") is not None
    assert main.fichier_dans_dist("../secret.db") is None
    assert main.fichier_dans_dist("../../etc/passwd") is None
    assert main.fichier_dans_dist("/etc/passwd") is None
    assert main.fichier_dans_dist("") is None  # un dossier n'est pas un fichier
