import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app import config
from app.api.routes import router
from app.api.auth import router as auth_router, initialiser_admin
from app.db.database import creer_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    creer_tables()
    initialiser_admin()
    yield


app = FastAPI(title="Continuum API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_origin_regex=config.CORS_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(router, prefix="/api")

@app.get("/api-status")
def root():
    return {"status": "ok", "message": "Continuum API is running"}

FRONTEND_DIR = os.path.realpath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))


def fichier_dans_dist(chemin_relatif: str):
    """Retourne le fichier demandé s'il est bien DANS le dossier dist, sinon None.

    Empêche de sortir du dossier avec des '..' (ex. pour lire la base de données).
    """
    candidat = os.path.realpath(os.path.join(FRONTEND_DIR, chemin_relatif))
    try:
        dedans = os.path.commonpath([FRONTEND_DIR, candidat]) == FRONTEND_DIR
    except ValueError:
        dedans = False
    if dedans and os.path.isfile(candidat):
        return candidat
    return None


if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        fichier = fichier_dans_dist(full_path)
        if fichier:
            return FileResponse(fichier)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
