FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configs
COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

RUN npm install

# Copy source files
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# Build shared package then web app
RUN npm run build --workspace=@fastquiz/shared
RUN npm run build --workspace=@fastquiz/web

# Production runtime using lightweight static server or nginx
FROM nginx:alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

