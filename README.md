# continuum
PCA / PRA platform

## Démarrage rapide (GitHub Codespaces, sans configuration)

1. Sur GitHub : **Code → Codespaces → Create codespace** sur la branche voulue.
2. Attendre la fin de l'installation : le terminal affiche l'adresse du site et les identifiants
   (aussi enregistrés dans `.codespace-acces.txt`, jamais commité).
3. Le site s'ouvre dans le navigateur (sinon : onglet **Ports**, port 8000, icône globe).

Dans un Codespace déjà ouvert, tout relancer avec : `bash scripts/codespace-start.sh`

> Une base de données neuve est créée dans chaque nouveau Codespace : elle ne contient que le compte administrateur.

## Installation manuelle

- **Backend** : `cd backend && cp .env.example .env` (renseigner `SECRET_KEY` et `ADMIN_PASSWORD`),
  puis `pip install -r requirements.txt && uvicorn main:app --port 8000`
- **Frontend** : `cd frontend && cp .env.example .env.local && npm install && npm run dev`
- **Tests** : `cd backend && pytest`
