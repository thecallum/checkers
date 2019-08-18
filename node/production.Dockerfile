FROM node:10 AS build
WORKDIR /app/
ADD package.json .
RUN npm install

FROM node:10 AS compile
WORKDIR /app/
COPY --from=build /app/ /app/
ADD src /app/src/
ADD webpack.config.js .
RUN npm run build 

FROM node:10-slim
RUN npm install --global --unsafe-perm pm2
WORKDIR /app/
COPY --from=compile /app/ /app/
ADD . .
EXPOSE 80
