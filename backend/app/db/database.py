from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Table, ForeignKey, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./continuum.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Table de liaison utilisateur <-> services
user_services = Table(
    "user_services",
    Base.metadata,
    Column("user_id", String, ForeignKey("utilisateurs.id")),
    Column("service_id", Integer, ForeignKey("services.id"))
)

class ServiceDB(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String, unique=True)
    description = Column(String, nullable=True)
    couleur = Column(String, default="#3b82f6")
    utilisateurs = relationship("UtilisateurDB", secondary=user_services, back_populates="services")

class UtilisateurDB(Base):
    __tablename__ = "utilisateurs"
    id = Column(String, primary_key=True)
    nom = Column(String)
    prenom = Column(String)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    mot_de_passe_hash = Column(String)
    organisation = Column(String, nullable=True)
    actif = Column(Boolean, default=True)
    date_creation = Column(DateTime, default=datetime.now)
    services = relationship("ServiceDB", secondary=user_services, back_populates="utilisateurs")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def creer_tables():
    Base.metadata.create_all(bind=engine)
