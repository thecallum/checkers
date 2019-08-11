FROM node:10 AS build
WORKDIR /root/node/src/
ADD package.json .
RUN ls
RUN npm install && \
    npm install --global pm2

FROM node:10 AS compile
WORKDIR /root/node/src/
COPY --from=build /root/node/src/ /root/node/src/
ADD src /root/node/src/src/
ADD webpack.config.js .
RUN ls 
# RUN pwd
RUN npm run build 

FROM node:10-slim
COPY --from=compile /root/node/src/ /root/node/src/
ADD . .
# RUN npm run build 
EXPOSE 80
CMD ["pm2-runtime", "start", "npm -- start"]