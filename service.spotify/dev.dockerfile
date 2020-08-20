FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./service.spotify/package*.json ./

# Install app dependencies
RUN npm i

# Bundle app source
COPY ./service.spotify .

#EXPOSE 3000

CMD [ "npm", "run", "start" ]