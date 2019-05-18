const jwt = require('jsonwebtoken');
const generateCookieOptions = require('../cookieOptions');

const getUser = (req, res, next) => {
    try {
        if (!req.cookies.sessionId) throw 'No Cookie';


        jwt.verify(req.cookies.sessionId, process.env.JWT_SECRET, (err, payload) => {
            if (err) throw err;

            req.user = payload;

            // update cookie expiration time 

            const user = {
                ...payload
            };
        
            const token = jwt.sign(user, process.env.JWT_SECRET);
        
            res.cookie('sessionId', token, generateCookieOptions(payload.stayLogged || false));

            next();
        })
    } catch (e) {
        req.user = null;
        next();
    }
}

module.exports = getUser;