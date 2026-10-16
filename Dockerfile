FROM node:24-bookworm-slim AS build
WORKDIR /workspace
COPY shared/ ./shared/
RUN npm ci --prefix shared && npm run build --prefix shared
COPY frontend/ ./frontend/
RUN npm ci --prefix frontend && npm run build --prefix frontend
COPY backend/ ./backend/
RUN npm ci --prefix backend && npm run build --prefix backend

FROM node:24-bookworm-slim
WORKDIR /workspace
COPY --from=build /workspace/shared/dist ./shared/dist
COPY shared/package.json shared/package-lock.json ./shared/
COPY --from=build /workspace/frontend/dist ./frontend/dist
COPY --from=build /workspace/backend/dist ./backend/dist
COPY backend/package.json backend/package-lock.json ./backend/
COPY backend/knexfile.ts ./backend/
COPY backend/migrations ./backend/migrations
COPY backend/seeds ./backend/seeds
COPY backend/src ./backend/src
COPY backend/catalog ./backend/catalog
RUN npm ci --omit=dev --prefix shared && npm ci --omit=dev --prefix backend
WORKDIR /workspace/backend
ENV NODE_ENV=production
ENV STATIC_DIR=/workspace/frontend/dist
EXPOSE 10000
CMD ["sh","-c","npm run migrate && npm run catalog:release && npm start"]
