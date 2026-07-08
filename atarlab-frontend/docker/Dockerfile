FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist/atarlab-frontend ./dist/atarlab-frontend
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
ENV PORT=4000
CMD ["node", "dist/atarlab-frontend/server/server.mjs"]
