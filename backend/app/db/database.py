from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Table, ForeignKey, Integer, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./continuum.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

user_services = Table(
    "user_services", Base.metadata,
    Column("user_id", String, ForeignKey("utilisateurs.id")),
    Column("service_id", Integer, ForeignKey("services.id"))
)

connecteur_services = Table(
    "connecteur_services", Base.metadata,
    Column("connecteur_id", Integer, ForeignKey("connecteurs.id")),
    Column("service_id", Integer, ForeignKey("services.id"))
)

class ServiceDB(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String, unique=True)
    description = Column(String, nullable=True)
    couleur = Column(String, default="#3b82f6")
    utilisateurs = relationship("UtilisateurDB", secondary=user_services, back_populates="services")
    connecteurs = relationship("ConnecteurDB", secondary=connecteur_services, back_populates="services")

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

class ConnecteurDB(Base):
    __tablename__ = "connecteurs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    nom = Column(String)
    type = Column(String)
    description = Column(String, nullable=True)
    global_ = Column(Boolean, default=False)
    champs = Column(JSON)
    mode_import = Column(String, default="fichier")
    actif = Column(Boolean, default=True)
    date_creation = Column(DateTime, default=datetime.now)
    services = relationship("ServiceDB", secondary=connecteur_services, back_populates="connecteurs")
    enregistrements = relationship("EnregistrementDB", back_populates="connecteur", cascade="all, delete")

class EnregistrementDB(Base):
    __tablename__ = "enregistrements"
    id = Column(Integer, primary_key=True, autoincrement=True)
    connecteur_id = Column(Integer, ForeignKey("connecteurs.id"))
    donnees = Column(JSON)
    date_import = Column(DateTime, default=datetime.now)
    importe_par = Column(String, nullable=True)
    connecteur = relationship("ConnecteurDB", back_populates="enregistrements")
    modifications = relationship("ModificationDB", back_populates="enregistrement", cascade="all, delete")
    commentaires = relationship("CommentaireDB", back_populates="enregistrement", cascade="all, delete")

class ModificationDB(Base):
    __tablename__ = "modifications"
    id = Column(Integer, primary_key=True, autoincrement=True)
    enregistrement_id = Column(Integer, ForeignKey("enregistrements.id"))
    champ = Column(String)
    valeur_avant = Column(Text, nullable=True)
    valeur_apres = Column(Text, nullable=True)
    modifie_par = Column(String)
    modifie_par_nom = Column(String)
    date_modification = Column(DateTime, default=datetime.now)
    enregistrement = relationship("EnregistrementDB", back_populates="modifications")

class CommentaireDB(Base):
    __tablename__ = "commentaires"
    id = Column(Integer, primary_key=True, autoincrement=True)
    enregistrement_id = Column(Integer, ForeignKey("enregistrements.id"))
    texte = Column(Text)
    auteur = Column(String)
    auteur_nom = Column(String)
    date = Column(DateTime, default=datetime.now)
    enregistrement = relationship("EnregistrementDB", back_populates="commentaires")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def creer_tables():
    Base.metadata.create_all(bind=engine)
