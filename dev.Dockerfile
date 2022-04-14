FROM nodered/node-red:1.1.3

COPY package.json .
RUN npm i

COPY settings.js /data/settings.js
