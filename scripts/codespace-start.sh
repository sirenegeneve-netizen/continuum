#!/usr/bin/env bash
# Démarre Continuum (backend + frontend) sans aucune manipulation.
# Lancé automatiquement à l'ouverture d'un Codespace ; relançable à la main :
#     bash scripts/codespace-start.sh
set -euo pipefail

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RACINE"
ACCES="$RACINE/.codespace-acces.txt"
PORT=8000

echo "[Continuum] Installation des dépendances..."
pip install -q -r backend/requirements.txt
(cd frontend && npm install --no-audit --no-fund --silent)

# Configuration du backend, créée une seule fois (secrets aléatoires, jamais commités).
if [ ! -f backend/.env ]; then
  SECRET="$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')"
  MDP="$(python3 -c 'import secrets; print(secrets.token_urlsafe(12))')"
  cat > backend/.env <<EOF
SECRET_KEY=$SECRET
ADMIN_EMAIL=admin@continuum.fr
ADMIN_PASSWORD=$MDP
EOF
  printf 'Email        : admin@continuum.fr\nMot de passe : %s\n(valable tant que vous ne l'"'"'avez pas changé dans la plateforme)\n' "$MDP" > "$ACCES"
fi

# Le backend sert aussi le site : l'API est donc à la même adresse (VITE_API_URL vide).
echo "[Continuum] Construction de l'interface..."
(cd frontend && VITE_API_URL="" npm run build --silent)

if curl -fs "http://localhost:$PORT/api-status" >/dev/null 2>&1; then
  echo "[Continuum] Le serveur tourne déjà sur le port $PORT."
else
  echo "[Continuum] Démarrage du serveur..."
  # Serveur totalement détaché du terminal (setsid + entrées/sorties redirigées) :
  # sinon la commande de démarrage du Codespace ne se terminerait jamais.
  cd backend
  setsid nohup python -m uvicorn main:app --host 0.0.0.0 --port "$PORT" \
    > /tmp/continuum.log 2>&1 < /dev/null &
  cd "$RACINE"
  for _ in $(seq 1 30); do
    curl -fs "http://localhost:$PORT/api-status" >/dev/null 2>&1 && break
    sleep 1
  done
  curl -fs "http://localhost:$PORT/api-status" >/dev/null 2>&1 || {
    echo "[Continuum] Le serveur n'a pas démarré. Journal :"; tail -30 /tmp/continuum.log; exit 1
  }
fi

echo
echo "=================================================================="
echo "  Continuum est prêt."
if [ -n "${CODESPACE_NAME:-}" ]; then
  echo "  Adresse : https://${CODESPACE_NAME}-${PORT}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
  echo "  (ou onglet « Ports », port $PORT, clic sur l'icône globe)"
else
  echo "  Adresse : http://localhost:$PORT"
fi
if [ -f "$ACCES" ]; then
  echo
  sed 's/^/  /' "$ACCES"
  echo "  (rappel enregistré dans .codespace-acces.txt)"
fi
echo "=================================================================="
