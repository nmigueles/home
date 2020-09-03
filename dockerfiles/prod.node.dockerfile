FROM node:12-alpine
ENV NODE_ENV=production

ARG service_name
ENV SERVICE ${service_name}

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./services/${service_name}/package*.json ./
RUN npm i

COPY ./services/${service_name} .

CMD [ "npm", "run", "start" ]