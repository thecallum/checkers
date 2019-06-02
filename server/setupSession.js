const Session = require('express-session');

const RedisStore = require('connect-redis')(Session);
const sessionStore = new RedisStore({
    host: 'localhost',
    port: 6379
});

const setupSession = app =>  {
    const session = Session({
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
    })

    app.use(session);

    return session;
};

module.exports = setupSession;