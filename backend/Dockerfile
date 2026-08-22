FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev)
RUN npm ci

COPY . .

# Собираем TypeScript
RUN npm run build

EXPOSE 3001

# Запускаем скомпилированный JS
CMD ["node", "dist/index.js"]