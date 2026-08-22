# frontend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 🔥 Передаем переменные в билд
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_ADMIN_PASSWORD
ENV VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD

RUN npm run build

# ============================================================
# ФИНАЛЬНЫЙ ОБРАЗ
# ============================================================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]