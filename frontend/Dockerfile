FROM node:23-alpine3.20 AS base

# Install dependencies in order to build the app
RUN apk add --no-cache g++ make py3-pip libc6-compat
WORKDIR /app

# Don't send data to Vercel
# https://vercel.com/docs/concepts/next.js/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies
FROM base AS deps

COPY package*.json ./
RUN npm ci

# Build for production
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]



# Development image
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev"]
