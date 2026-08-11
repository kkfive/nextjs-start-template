FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate

FROM base AS builder
RUN apk add --no-cache git
WORKDIR /workspace
RUN git init

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY internal/tsconfig/package.json internal/tsconfig/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter api...

COPY apps/api apps/api
COPY packages/contracts packages/contracts
COPY internal/tsconfig internal/tsconfig

RUN pnpm --filter api build \
    && pnpm --config.strict-peer-dependencies=false --filter api --prod --legacy --ignore-scripts deploy /prod/api

FROM node:24-alpine AS runner
ENV NODE_ENV=production
ENV PORT=8787
WORKDIR /app

COPY --from=builder --chown=node:node /prod/api ./

USER node
EXPOSE 8787
CMD ["node", "dist/server.mjs"]
