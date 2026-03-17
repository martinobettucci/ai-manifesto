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

- Site: `http://localhost:8080`
- API: `http://localhost:3001`
- Mailpit: `http://localhost:8025`

Les emails de confirmation sont capturés par Mailpit en local pour tester le parcours de validation.

### Prod (détaché)

```bash
./runProd.sh
```

Variables attendues pour SMTP:
- `SMTP_USER` (ou `SCW_SCW_DEFAULT_PROJECT_ID`, ou `SCW_DEFAULT_PROJECT_ID` converti en `SCW_<PROJECT_ID>`)
- `SMTP_PASS` (ou `SCW_SECRET_KEY`)
- `SMTP_REQUIRE_AUTH=true` en production (activé par défaut)
