# Etapa 1: Construção
FROM node:18 AS builder
# WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

# Etapa 2: Execução
FROM node:18
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=builder /dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
EXPOSE 3599

CMD ["node", "dist/src/main"]
