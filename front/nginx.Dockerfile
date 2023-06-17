# FROM node:14.17.6 AS builder
# WORKDIR /usr/src/app
# COPY . .
# RUN npm install
# RUN npm run build:production --if-present

FROM nginx
# COPY --from=builder /usr/src/app/public /usr/share/nginx/html
COPY dist /usr/share/nginx/html
