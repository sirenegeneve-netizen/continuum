import threading
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app import config

SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = config.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verifier_mot_de_passe(mot_de_passe: str, hash: str) -> bool:
    return pwd_context.verify(mot_de_passe, hash)


def hasher_mot_de_passe(mot_de_passe: str) -> str:
    return pwd_context.hash(mot_de_passe)


def creer_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verifier_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


class LimiteurEchecs:
    """Compte les échecs récents par clé (en mémoire, par processus)."""

    def __init__(self, max_echecs: int, fenetre_secondes: int):
        self.max_echecs = max_echecs
        self.fenetre = fenetre_secondes
        self._echecs = defaultdict(deque)
        self._verrou = threading.Lock()

    def _purger(self, cle: str, maintenant: float):
        file = self._echecs[cle]
        while file and maintenant - file[0] > self.fenetre:
            file.popleft()
        if not file:
            self._echecs.pop(cle, None)

    def secondes_restantes(self, cle: str) -> int:
        """0 si la clé n'est pas bloquée, sinon le délai avant le prochain essai."""
        with self._verrou:
            maintenant = time.monotonic()
            self._purger(cle, maintenant)
            file = self._echecs.get(cle)
            if file and len(file) >= self.max_echecs:
                return max(1, int(self.fenetre - (maintenant - file[0])))
            return 0

    def echec(self, cle: str):
        with self._verrou:
            self._echecs[cle].append(time.monotonic())

    def reussite(self, cle: str):
        with self._verrou:
            self._echecs.pop(cle, None)

    def reinitialiser(self):
        with self._verrou:
            self._echecs.clear()


limiteur_compte = LimiteurEchecs(config.LOGIN_MAX_ECHECS_COMPTE, config.LOGIN_FENETRE_SECONDES)
limiteur_ip = LimiteurEchecs(config.LOGIN_MAX_ECHECS_IP, config.LOGIN_FENETRE_SECONDES)
