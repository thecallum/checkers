FROM node:10 AS build
WORKDIR /app/
ADD package.json .
RUN npm install --global yarn && \
    yarn && \
    yarn add --global pm2

FROM node:10 AS compile
WORKDIR /app/
COPY --from=build . .
ADD src /app/src/
ADD webpack.config.js .
RUN yarn build 

FROM node:10-slim
WORKDIR /app/
COPY --from=compile . .
ADD . .
EXPOSE 80
CMD ["pm2-runtime", "start", "npm -- start"]