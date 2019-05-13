const jwt = require('jsonwebtoken');

const getUser = (req, res, next) => {
    try {
        if (!req.cookies.jwt) throw 'No Cookie';

        jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, payload) => {
            if (err) throw err;

            req.user = payload;
            next();
        })
    } catch (e) {
        req.user = null;
        next();
    }
}

module.exports = getUser;