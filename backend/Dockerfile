# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /workspace

# shared must be installed by file:../shared, so copy both packages
COPY shared/package.json shared/package.json
COPY shared/src shared/src

COPY backend/package.json backend/tsconfig.json backend/
COPY backend/src backend/src
COPY backend/migrations backend/migrations
COPY backend/seeds backend/seeds
COPY backend/knexfile.ts backend/

WORKDIR /workspace/shared
RUN npm ci --ignore-scripts || npm install --ignore-scripts
RUN npm run build

WORKDIR /workspace/backend
RUN npm install --ignore-scripts
# tsx runs migrations at runtime; build TS for the serve step
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runtime
WORKDIR /workspace

COPY --from=build /workspace/shared /workspace/shared
COPY --from=build /workspace/backend /workspace/backend
COPY --from=build /workspace/backend/node_modules /workspace/backend/node_modules
COPY --from=build /workspace/shared/node_modules /workspace/shared/node_modules

WORKDIR /workspace/backend
ENV NODE_ENV=production
EXPOSE 4000

# Run migrations, then start the compiled server
CMD ["sh", "-c", "npx tsx src/scripts/knex-cli.ts migrate && node dist/server.js"]
