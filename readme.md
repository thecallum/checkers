Checkers board game built with VueJS, NodeJS and Docker

## About

Checkers board game built with VueJS, NodeJS and Docker.

Checkers was the first large project that I build. The primary thing that I learned was to keep projects small. The project became too big, plus I didn't create any specication beforehand, so I was never able to complete it.

I also learned how to use Docker, and a small amount of NGINX. Docker is great because it let's you containerize processes, where each container holds the entire environment of its process. In other words, you don't have to worry about deploying an app to a specific environment, because once you've setup the app in Docker, the app can run anywhere.

The game has three modes:
- Multiplayer, play against another human on the same computer
- Online, play against a random player online
- Singleplayer, against a computer player

The first two modes worked great, however, I didn't have enough time to develope a computer player.

The online mode uses websockets to allow communication between differente players. A player can join the queue, and will be matched with another player in the queue. 

## Required environment variables


- DEVELOPMENT
- COOKIE_SECRET
- PORT
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_DATABASE
- cloud_name
- api_key
- api_secret
- PAGE_URL

Creating a self signed key:
https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04

sudo mkdir /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt

Or, just use https://www.sslforfree.com/

// optimize docker build process
Split build into multiple stages, allowing docker to cache each stage
Fixed npm global module error by using yarn global


## Development

```
yarn install
make dev
yarn dev
```

Runs on http://localhost:8000

## Production

```
make prod
```

Runs on http://localhost:80
