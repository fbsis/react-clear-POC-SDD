# syntax=docker/dockerfile:1.7

FROM node:24.18.0-bookworm-slim AS node-base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

FROM node-base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM dependencies AS development
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev"]

FROM dependencies AS quality
COPY . .
RUN pnpm check

FROM dependencies AS build
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
COPY . .
RUN pnpm build

FROM scratch AS export
COPY --from=build /app/dist /

FROM nginxinc/nginx-unprivileged:1.29.5-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

FROM mcr.microsoft.com/playwright:v1.62.1-noble AS e2e
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.20.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-e2e,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
CMD ["pnpm", "test:e2e"]
