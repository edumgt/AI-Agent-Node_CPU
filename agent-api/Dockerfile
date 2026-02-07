FROM node:20-slim

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i

COPY src ./src
EXPOSE 8080
ENV PORT=8080

CMD ["node", "src/server.js"]
