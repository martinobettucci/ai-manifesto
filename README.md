# AI Manifesto

Landing page React + Vite avec backend Express + SQLite, le tout orchestré par Docker Compose.

## Stack

- `apps/client`: React, Vite, `react-i18next`
- `apps/server`: Express, SQLite (`better-sqlite3`), `nodemailer`
- `docker-compose.dev.yml`: environnement local avec Mailpit
- `docker-compose.prod.yml`: environnement production avec SMTP transactionnel (Scaleway TEM)

## Démarrage local

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

## Avec Docker Compose

### Dev (attaché, avec Mailpit)

```bash
./runDev.sh
```

Le mode dev monte les sources `apps/client` et `apps/server` dans les conteneurs pour un rechargement en temps réel.
`runDev.sh` ouvre automatiquement l'UI et Mailpit quand ils répondent (désactivable avec `OPEN_DEV_PAGES=false`).

- Site: `http://localhost:8080`
- API: `http://localhost:3001`
- Mailpit: `http://localhost:8025`

Les emails de confirmation sont capturés par Mailpit en local pour tester le parcours de validation.

### Prod (détaché)

```bash
./runProd.sh
```

Le mode prod build des images stables avec `COPY` des sources (pas de bind mount applicatif).

Pour arrêter la stack prod:

```bash
./stopProd.sh
```

`runProd.sh` charge automatiquement `.env` (s'il existe), puis lance `docker compose`.

Variables attendues pour la prod:

- `SMTP_USER`: requis
- `SMTP_PASS`: requis
- `SMTP_PORT`: optionnel, défaut `465`
- `SMTP_SECURE`: optionnel, défaut `true`
- `SMTP_REQUIRE_AUTH`: optionnel, défaut `true`
- `SMTP_CONNECTION_TIMEOUT_MS`: optionnel, défaut `15000`
- `SMTP_GREETING_TIMEOUT_MS`: optionnel, défaut `15000`
- `SMTP_SOCKET_TIMEOUT_MS`: optionnel, défaut `20000`
- `SMTP_DNS_TIMEOUT_MS`: optionnel, défaut `10000`
- `SMTP_VERIFY_ON_STARTUP`: optionnel, défaut `true` en prod (`false` en dev), lance un test SMTP au démarrage avec log explicite
- `SMTP_FROM`: optionnel, défaut `Manifesto IA <noreply@manifesto-ia.org>`
- `ADMIN_EMAIL`: optionnel mais requis pour activer le backoffice magic link
- `ADMIN_MAGIC_LINK_TTL_MINUTES`: optionnel, défaut `15`
- `ADMIN_SESSION_TTL_HOURS`: optionnel, défaut `24`
- `ADMIN_COOKIE_NAME`: optionnel, défaut `manifesto_admin_session`

Exemple `.env` minimal:

```bash
SMTP_USER=smtp_username
SMTP_PASS=smtp_password
ADMIN_EMAIL=admin@manifesto-ia.org
```

Exemple `.env` complet:

```bash
SMTP_USER=smtp_username
SMTP_PASS=smtp_password
SMTP_PORT=465
SMTP_SECURE=true
SMTP_REQUIRE_AUTH=true
SMTP_CONNECTION_TIMEOUT_MS=15000
SMTP_GREETING_TIMEOUT_MS=15000
SMTP_SOCKET_TIMEOUT_MS=20000
SMTP_DNS_TIMEOUT_MS=10000
SMTP_VERIFY_ON_STARTUP=true
SMTP_FROM="Manifesto IA <noreply@manifesto-ia.org>"
ADMIN_EMAIL=admin@manifesto-ia.org
ADMIN_MAGIC_LINK_TTL_MINUTES=15
ADMIN_SESSION_TTL_HOURS=24
ADMIN_COOKIE_NAME=manifesto_admin_session
```

### Logs Docker (tous les conteneurs en cours)

```bash
./runLogs.sh
```

Le script suit les logs de tous les conteneurs Docker actifs (pas seulement la stack prod) et préfixe chaque ligne avec le nom du conteneur.

Les logs API sont en JSON (une ligne par événement) avec un `requestId` pour corréler:
- la requête HTTP
- les erreurs de validation (`4xx`)
- les erreurs serveur (`5xx`)
- les erreurs SMTP détaillées (code/réponse/stack tronquée)

## Claude Code en Docker

Image minimale dédiée à Claude Code:

```bash
./runClaudeCode.sh
```

Ce script:
- build l'image définie dans `Dockerfile.claude-code`
- monte le dossier courant dans `/workspace`
- ouvre un conteneur interactif avec `claude`
- persiste les réglages globaux et l'authentification Claude dans le volume Docker `ai-manifesto-claude-code-home` monté sur `~/.claude`

Pour ouvrir un shell dans le conteneur à la place:

```bash
./runClaudeCode.sh bash
```

Pour changer le nom du volume persistant:

```bash
CLAUDE_HOME_VOLUME=my-claude-home ./runClaudeCode.sh
```
