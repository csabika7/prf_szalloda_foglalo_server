FROM node:11.14.0-alpine

WORKDIR /app
COPY src src
COPY package.json .

RUN npm install

EXPOSE 3000

CMD npm start