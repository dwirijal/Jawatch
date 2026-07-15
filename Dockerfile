FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile

FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL=https://jawatch.web.id
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=
ARG NEXT_PUBLIC_DONATE_URL=
ARG NEXT_PUBLIC_GADS_CLIENT_ID=
# Self-hosted content backend wiring. Toggle off (set to 0) to fall back to Sanka.
ARG JAWATCH_USE_LOCAL_API=1
ARG JAWATCH_LOCAL_API_URL=http://jawatch-api:8080
ARG JAWATCH_LOCAL_API_TIMEOUT_MS=4000
ENV JAWATCH_USE_LOCAL_API=$JAWATCH_USE_LOCAL_API
ENV JAWATCH_LOCAL_API_URL=$JAWATCH_LOCAL_API_URL
ENV JAWATCH_LOCAL_API_TIMEOUT_MS=$JAWATCH_LOCAL_API_TIMEOUT_MS
RUN bun run build

FROM oven/bun:1-alpine AS runner
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 nextjs
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Mirror build-time env to runtime
ENV JAWATCH_USE_LOCAL_API=$JAWATCH_USE_LOCAL_API
ENV JAWATCH_LOCAL_API_URL=$JAWATCH_LOCAL_API_URL
ENV JAWATCH_LOCAL_API_TIMEOUT_MS=$JAWATCH_LOCAL_API_TIMEOUT_MS
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
