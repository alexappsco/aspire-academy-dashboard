FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
# The committed lock file is out of sync with package.json, so `npm ci` refuses it;
# `npm install` resolves from the lock file where it can and fills in the rest.
RUN npm install --no-audit --no-fund

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into the bundle at build time.
ARG NEXT_PUBLIC_HOST_API
ARG NEXT_PUBLIC_ASSETS_API
ENV NEXT_PUBLIC_HOST_API=$NEXT_PUBLIC_HOST_API
ENV NEXT_PUBLIC_ASSETS_API=$NEXT_PUBLIC_ASSETS_API
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
