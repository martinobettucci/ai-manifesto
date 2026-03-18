FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json

RUN npm install --workspace client

FROM deps AS dev

COPY apps/client apps/client

WORKDIR /app/apps/client

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace", "client"]

FROM deps AS build

COPY apps/client apps/client

RUN npm run build --workspace client

FROM nginx:1.27-alpine AS production

COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80
