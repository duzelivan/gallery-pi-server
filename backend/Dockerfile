FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache vips-dev

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]