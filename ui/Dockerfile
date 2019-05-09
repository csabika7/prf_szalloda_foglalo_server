FROM node:11.14.0-alpine

WORKDIR /app
COPY package.json package.json
COPY angular.json angular.json
COPY tsconfig.json tsconfig.json
COPY src/ src/

RUN npm install
RUN npm install -g @angular/cli

EXPOSE 4200

CMD ng serve --host 0.0.0.0