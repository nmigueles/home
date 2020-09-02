FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./services/service.scheduler/package*.json ./

# Install app dependencies
RUN npm i

# Bundle app source
COPY ./services/service.scheduler .

CMD [ "npm", "run", "start" ]