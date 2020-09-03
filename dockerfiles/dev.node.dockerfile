FROM node:12-alpine
ENV NODE_ENV=development

ARG service_name
ENV SERVICE ${service_name}
ENV PORT 80

# Install nodemon
RUN npm i -g nodemon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY ./services/${service_name}/package.json .
RUN npm i

# Move one level up so node_modules is not overwritten by a mounted directory
RUN mv node_modules /usr/src/node_modules

# Bundle app source
COPY ./services/${service_name} .

EXPOSE 80

CMD nodemon --watch . --legacy-watch --exec npm start
