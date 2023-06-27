FROM node:18.16.0-alpine
LABEL authors="Yukiix"
RUN npm install -g npm@9.7.2
COPY ./package.json ./package.json
COPY ./prisma ./prisma
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json
COPY ./yarn.lock ./yarn.lock
RUN yarn install
RUN npx prisma generate
ENTRYPOINT yarn bot