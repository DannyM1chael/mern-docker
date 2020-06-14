FROM node:alpine

WORKDIR /app

CMD ls -ltr && npm install && npm start