const Session = require('express-session');

const RedisStore = require('connect-redis')(Session);
const sessionStore = new RedisStore({
    host: 'localhost',
    port: 6379
});

const setupSession = () => Session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: false,
    rolling: true,
    store: sessionStore,
    cookie: {
        secure: !process.env.development,
        maxAge: 1000 * 60 * 60,
        domain: 'localhost',
        httpOnly: true,
        path: '/',
        sameSite: true
    },
    name: 'sessionID'
});

module.exports = setupSession;