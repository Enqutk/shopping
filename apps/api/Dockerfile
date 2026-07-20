# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY apps/api apps/api
COPY libs libs
COPY drizzle drizzle
COPY tsconfig.json ./

RUN npm ci
RUN npx nx sync
RUN npx nx run api:build --configuration=production
RUN npx nx run api:prune-lockfile

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist/package.json ./
COPY --from=builder /app/apps/api/dist/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/apps/api/dist/main.js ./
RUN mkdir -p node_modules/@shopping
COPY --from=builder /app/libs/database ./node_modules/@shopping/database
COPY --from=builder /app/libs/shared ./node_modules/@shopping/shared

EXPOSE 3000
CMD ["node", "main.js"]
