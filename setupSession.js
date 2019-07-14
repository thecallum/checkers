const Session = require('express-session');

if (!process.env.PAGE_URL) throw 'Missing env variable PAGE_URL';

const RedisStore = require('connect-redis')(Session);
const sessionStore = new RedisStore(
    process.env.REDISCLOUD_URL
        ? {
              url: process.env.REDISCLOUD_URL,
          }
        : {
              host: process.env.PAGE_URL,
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
            secure: true,
            maxAge: 1000 * 60 * 60,
            // domain: process.env.PAGE_URL,
            httpOnly: true,
            path: '/',
            // sameSite: true,
        },
        name: 'sessionID',
    });

module.exports = setupSession;
