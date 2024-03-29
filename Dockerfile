FROM node:19

# Create app directory
WORKDIR /usr/src/app/


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Remove (local) test config, should be added via docker volume
RUN rm -f src/config/jobs.json

EXPOSE 80
CMD [ "node", "src/index.js" ]
