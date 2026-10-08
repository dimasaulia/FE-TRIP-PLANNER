# syntax=docker/dockerfile:1

# ---- deps ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time config comes from FE/.env (copied with the sources):
# NEXT_PUBLIC_* are inlined into the browser bundle and BACKEND_URL is baked
# into the /api rewrite. .env.local (developer machine) is never copied.
RUN test -f .env || (echo "FE/.env is missing: copy .env.example to .env and fill it in" && exit 1)
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runtime ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=15s --retries=5 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/login" >/dev/null || exit 1

# Runtime values (BACKEND_URL for the server-side session check) come from
# the same FE/.env through env_file in docker-compose.yml.
CMD ["node", "server.js"]
