# Container build file for the pixelcheer.mcqn.com website
# Argon is latest LTS version of Node
FROM node:argon 
MAINTAINER adrianm@mcqn.com

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]

