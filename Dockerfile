FROM node:23-alpine3.21 AS base

# Install dependencies in order to build the app
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app

# Don't send data to Vercel
# https://vercel.com/docs/concepts/next.js/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
FROM base AS deps

COPY frontend/package*.json ./
RUN npm ci

# Build for production
FROM base AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/. .
RUN npm run build


FROM python:3.12-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev postgresql-dev python3-dev libffi-dev

COPY backend/requirements.txt .

RUN pip install --no-cache-dir --upgrade --prefix=/install -r requirements.txt


FROM python:3.12-alpine

WORKDIR /app

RUN apk add --no-cache libpq ffmpeg

COPY --from=builder /install /usr/local

COPY backend/. .

# Setup frontend
ENV NODE_ENV=production

# Install nodejs
RUN apk add --no-cache curl nodejs npm

# Setup perms
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# RUN mkdir .next
# RUN chown nextjs:nodejs .next
# Copy frontend files
COPY --from=frontend-builder --chown=nextjs:nodejs /app/public ./frontend/public
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/standalone ./frontend
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next/static ./frontend/.next/static

ENV HOSTNAME="0.0.0.0"

# Setup Nginx
RUN apk add --no-cache nginx
RUN rm /etc/nginx/http.d/default.conf
COPY nginx/nginx_one_container.conf /etc/nginx/nginx.conf

# Install supervisord to run both processes
RUN apk add --no-cache supervisor

# Supervisor config
COPY supervisor.conf /etc/supervisor/conf.d/supervisor.conf

RUN chmod +x /app/init-db.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]


EXPOSE 80

RUN mkdir -p /app/logs && chown -R nextjs:nodejs /app/logs
# USER nextjs

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisor.conf"]
