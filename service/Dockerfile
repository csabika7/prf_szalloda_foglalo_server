FROM node:11.14.0-alpine

RUN mkdir /root/src

COPY ./src /root/src
COPY package.json /root

EXPOSE 3000

RUN cd /root && npm install

CMD cd /root && npm start