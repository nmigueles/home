FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./service.discord/package*.json ./

# Install app dependencies
RUN npm i

# Bundle app source
COPY ./service.discord .

#EXPOSE 3000

CMD [ "npm", "run", "start" ]