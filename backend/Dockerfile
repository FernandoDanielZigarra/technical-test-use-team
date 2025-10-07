FROM node:20-alpine AS development-dependencies-env
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY . /app
WORKDIR /app
ENV CI=true
RUN corepack enable pnpm && pnpm install --no-frozen-lockfile

FROM node:20-alpine AS build-env
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
ENV CI=true
RUN corepack enable pnpm && pnpm prisma generate && pnpm run build

FROM node:20-alpine
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN corepack enable pnpm
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/dist /app/dist
COPY --from=development-dependencies-env /app/prisma /app/prisma
RUN pnpm prisma generate
CMD ["pnpm", "run", "start:prod"]