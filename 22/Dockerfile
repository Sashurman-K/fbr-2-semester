FROM "node:alpine"

WORKDIR /app

RUN npm install express

COPY server.js .

ENTRYPOINT ["node", "server.js"]