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

# ── Stage 2 — Production (Nginx) ────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Minimal Nginx config — SPA fallback to index.html
COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # Reverse proxy for API requests\n\
    location /api/ {\n\
    proxy_pass http://backend:3000/;\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
    \n\
    # SPA: redirect all non-file requests to index.html\n\
    location / {\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # Cache static assets aggressively\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
    }\n\
    \n\
    # Security headers\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    }\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]