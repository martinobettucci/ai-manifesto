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

- `SMTP_USER`: requis, sauf si dérivé via `SCW_SCW_DEFAULT_PROJECT_ID` ou `SCW_DEFAULT_PROJECT_ID`
- `SMTP_PASS`: requis, sauf si dérivé via `SCW_SECRET_KEY`
- `SCW_SCW_DEFAULT_PROJECT_ID`: optionnel, utilisé comme fallback pour `SMTP_USER`
- `SCW_DEFAULT_PROJECT_ID`: optionnel, fallback pour `SMTP_USER` (`SCW_<PROJECT_ID>`)
- `SCW_SECRET_KEY`: optionnel, fallback pour `SMTP_PASS`
- `SMTP_PORT`: optionnel, défaut `465`
- `SMTP_SECURE`: optionnel, défaut `true`
- `SMTP_REQUIRE_AUTH`: optionnel, défaut `true`
- `SMTP_FROM`: optionnel, défaut `Manifesto IA <noreply@manifesto-ia.org>`

Exemple `.env` minimal:

```bash
SMTP_USER=SCW_xxxxxxxxx
SMTP_PASS=xxxxxxxxx
```

Exemple `.env` complet:

```bash
SMTP_USER=SCW_xxxxxxxxx
SMTP_PASS=xxxxxxxxx
SMTP_PORT=465
SMTP_SECURE=true
SMTP_REQUIRE_AUTH=true
SMTP_FROM="Manifesto IA <noreply@manifesto-ia.org>"
```

### Logs Docker (tous les conteneurs en cours)

```bash
./runLogs.sh
```

Le script suit les logs de tous les conteneurs Docker actifs (pas seulement la stack prod) et préfixe chaque ligne avec le nom du conteneur.

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
