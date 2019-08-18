# Required environment variables

DEVELOPMENT
COOKIE_SECRET
PORT

DB_HOST
DB_USER
DB_PASSWORD
DB_DATABASE

Creating a self signed key:
https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04

sudo mkdir /etc/nginx/ssl

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/ngin

// optimize docker build process
Split build into multiple stages, allowing docker to cache each stage
Fixed npm global module error by using yarn global

===============
/\/\/\DEV/\/\/\
===============
yarn install

make dev
yarn dev

// localhost:8000

===============
/\/\/\PROD/\/\/\
===============

make prod

// localhost:80
