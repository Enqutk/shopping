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
RUN npx nx run api:build --configuration=production
RUN npx nx run api:prune

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./

RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", "main.js"]
