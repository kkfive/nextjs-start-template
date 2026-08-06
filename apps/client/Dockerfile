FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate

FROM base AS builder
RUN apk add --no-cache git
WORKDIR /workspace
RUN git init

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ARG API_BASE_URL
RUN test -n "$NEXT_PUBLIC_APP_URL" \
    && test -n "$NEXT_PUBLIC_API_URL" \
    && test -n "$API_BASE_URL" \
    || (echo "缺少 Client 构建所需的地址变量" >&2; exit 1)
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_BASE_URL=$API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter client build

FROM node:24-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app/apps/client

COPY --from=builder --chown=node:node /workspace/apps/client/public ./public
COPY --from=builder --chown=node:node /workspace/apps/client/.next/standalone /app
COPY --from=builder --chown=node:node /workspace/apps/client/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
