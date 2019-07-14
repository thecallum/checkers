const Session = require('express-session');

const RedisStore = require('connect-redis')(Session);
const sessionStore = new RedisStore(
    process.env.REDDISCLOUD_URL
        ? {
              url: process.env.REDDISCLOUD_URL,
          }
        : {
              host: 'localhost',
              port: 6379,
          }
);

if (!process.env.COOKIE_SECRET) throw 'Missing env variable COOKIE_SECRET';

const setupSession = () =>
    Session({
        secret: process.env.COOKIE_SECRET,
        resave: true,
        saveUninitialized: false,
        rolling: true,
        store: sessionStore,
        cookie: {
            secure: !process.env.DEVELOPMENT,
            maxAge: 1000 * 60 * 60,
            domain: 'localhost',
            httpOnly: true,
            path: '/',
            sameSite: true,
        },
        name: 'sessionID',
    });

module.exports = setupSession;
