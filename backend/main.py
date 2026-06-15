from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.auth import router as auth_router
from app.db.database import creer_tables

app = FastAPI(title="Continuum API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

creer_tables()

app.include_router(auth_router, prefix="/auth")
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Continuum API is running"
    }
