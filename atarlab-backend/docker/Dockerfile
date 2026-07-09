FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
# Runs migrations before every boot (idempotent — a no-op once applied) instead of
# relying on Render's preDeployCommand, which requires a paid plan.
CMD ["sh", "-c", "npm run migration:run:prod && node dist/main.js"]
