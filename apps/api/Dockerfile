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

# Webpack generates dist/package.json with all runtime externals.
WORKDIR /app/apps/api/dist
RUN npm install --omit=dev
RUN mkdir -p node_modules/@shopping \
  && cp -r /app/libs/database node_modules/@shopping/database \
  && cp -r /app/libs/shared node_modules/@shopping/shared

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./

EXPOSE 3000
CMD ["node", "main.js"]
