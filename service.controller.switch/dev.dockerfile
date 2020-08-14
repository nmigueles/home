FROM node:12-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./service.controller.switch/package*.json ./

# Install app dependencies
RUN npm ci --quiet --only=production

# Bundle app source
COPY ./service.controller.switch .

EXPOSE 3000

CMD [ "npm", "run", "start" ]