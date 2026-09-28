FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/admin/package.json ./apps/admin/

RUN npm install

COPY packages/shared/ ./packages/shared/
COPY apps/admin/ ./apps/admin/

RUN npm run build --workspace=@fastquiz/shared
RUN npm run build --workspace=@fastquiz/admin

FROM nginx:alpine AS runner
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

