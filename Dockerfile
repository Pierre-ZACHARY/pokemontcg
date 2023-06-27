FROM node:18.16.0-alpine
LABEL authors="Yukiix"
COPY . .
RUN npm install -g npm@9.7.2
RUN yarn install
RUN yarn bot