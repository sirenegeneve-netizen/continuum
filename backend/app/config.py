"""Configuration centralisée, lue depuis les variables d'environnement (ou backend/.env)."""
import logging
import os
import secrets

from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("continuum")


def _liste(valeur: str) -> list:
    return [v.strip() for v in valeur.split(",") if v.strip()]


# ── Base de données ─────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./continuum.db")

# ── Jetons d'authentification ───────────────────────────────────────
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

SECRET_KEY = os.getenv("SECRET_KEY", "")
if len(SECRET_KEY) < 32:
    if SECRET_KEY:
        log.warning("SECRET_KEY est trop courte (32 caractères minimum) : elle est ignorée.")
    else:
        log.warning("SECRET_KEY n'est pas définie.")
    # Clé aléatoire propre à ce processus : les sessions sautent à chaque redémarrage.
    SECRET_KEY = secrets.token_urlsafe(48)
    log.warning(
        "Une clé temporaire a été générée : tous les utilisateurs seront déconnectés au "
        "prochain redémarrage. Définissez SECRET_KEY dans backend/.env (voir .env.example)."
    )

# ── Compte administrateur initial ───────────────────────────────────
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@continuum.fr").strip()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

# ── Mots de passe ───────────────────────────────────────────────────
MIN_PASSWORD_LENGTH = 10

# ── Limitation des tentatives de connexion ──────────────────────────
LOGIN_MAX_ECHECS_COMPTE = int(os.getenv("LOGIN_MAX_ECHECS_COMPTE", "5"))
LOGIN_MAX_ECHECS_IP = int(os.getenv("LOGIN_MAX_ECHECS_IP", "30"))
LOGIN_FENETRE_SECONDES = int(os.getenv("LOGIN_FENETRE_SECONDES", "900"))

# ── CORS ────────────────────────────────────────────────────────────
CORS_ORIGINS = _liste(os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"))
CORS_ORIGIN_REGEX = os.getenv("CORS_ORIGIN_REGEX") or None

# ── Imports de fichiers ─────────────────────────────────────────────
TAILLE_MAX_IMPORT_OCTETS = int(os.getenv("TAILLE_MAX_IMPORT_MO", "10")) * 1024 * 1024
