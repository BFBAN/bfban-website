FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 4000

CMD ["node", "app.js"]
