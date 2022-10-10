# created because this version of bfban is far behind the current node version, and i dont want to switch when working on gametools and bfban

FROM node:14

WORKDIR /usr/src/app

COPY . .

RUN npm install && npm cache clean --force

EXPOSE 8080

CMD [ "npm", "run", "serve:production" ]

# docker build . -t bfban-testing
# docker run  --mount type=bind,source=$PWD/src,target=/usr/src/app/src --network host bfban-testing