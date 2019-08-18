FROM node:10 AS build
WORKDIR /app/
ADD package.json .
RUN npm install

FROM node:10-slim
RUN npm install --global --unsafe-perm pm2
WORKDIR /app/
COPY --from=build /app/ /app/
ADD . .
EXPOSE 80