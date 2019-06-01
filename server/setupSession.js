const Session = require('express-session');
const Store = require('express-mysql-session')(Session);
const con = require('./db/connection');
const sessionStore = new Store({}, con);

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