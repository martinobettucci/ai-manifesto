FROM node:20-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json

FROM base AS deps-dev
RUN npm install --workspace server

FROM base AS deps-prod
RUN npm install --omit=dev --workspace server

FROM deps-dev AS dev
COPY apps/server apps/server
WORKDIR /app/apps/server
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM deps-prod AS production
COPY apps/server apps/server
WORKDIR /app/apps/server
EXPOSE 3001
CMD ["npm", "run", "start"]
