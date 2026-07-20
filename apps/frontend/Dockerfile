# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY apps/frontend apps/frontend
COPY libs libs
COPY tsconfig.json ./

RUN npm ci
RUN npx nx sync
RUN npx nx run frontend:build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/frontend/server.js"]
