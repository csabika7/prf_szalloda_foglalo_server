FROM node:11.14.0-alpine

COPY ./src /root
COPY package.json /root

EXPOSE 3000

RUN cd /root && npm install

CMD cd /root && npm start