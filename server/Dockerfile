FROM node:10.16.3-alpine

WORKDIR /usr/app/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
