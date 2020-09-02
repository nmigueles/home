FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./services/service.discord/package*.json ./

# Install app dependencies
RUN npm i

# Bundle app source
COPY ./services/service.discord .

#EXPOSE 3000

CMD [ "npm", "run", "start" ]