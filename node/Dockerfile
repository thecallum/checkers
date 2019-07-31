FROM node:10
WORKDIR /root/node/src/
COPY . .
RUN apt-get update && \
    apt-get upgrade -y && \
    npm install --global yarn && \
    npm install --global pm2 && \
    yarn && \
    yarn build 
EXPOSE 80

CMD ["pm2-runtime", "start", "npm -- start"]