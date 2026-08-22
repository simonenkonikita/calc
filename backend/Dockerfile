# backend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходники
COPY . .

# Собираем TypeScript
RUN npm run build

# Открываем порт
EXPOSE 3001

# Запускаем
CMD ["node", "dist/index.js"]