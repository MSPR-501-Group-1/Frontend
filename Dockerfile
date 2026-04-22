# ─────────────────────────────────────────────────────────────
# Multi-stage Dockerfile — HealthAI Admin
# Stage 1 : build (Node 22 Alpine)
# Stage 2 : serve (Nginx Alpine — image finale < 30 MB)
# ─────────────────────────────────────────────────────────────

# ── Stage 1 — Build ──────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ARG VITE_USE_MOCKS=false
ENV VITE_USE_MOCKS=$VITE_USE_MOCKS

# Copy only package manifests first for better layer caching (DRY: install once)
COPY healthai-admin/package.json healthai-admin/package-lock.json* ./

RUN npm ci --ignore-scripts

# Copy source code after deps are cached
COPY healthai-admin/ .

RUN npm run build

# ── Stage 2 — Production (Nginx) ─────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config (much more readable than RUN printf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]