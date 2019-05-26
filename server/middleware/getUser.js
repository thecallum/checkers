const generateCookieOptions = require('../cookieOptions');

const getUser = (req, res, next) => {

    try {
        if (!req.signedCookies.sessionId) throw 'No Cookie';

        const cookie = req.signedCookies.sessionId;
        const payload = JSON.parse(cookie)
        req.user = payload;

        // update cookie expiration time 

        res.cookie('sessionId', cookie, generateCookieOptions(payload.stayLogged || false));
        next();
    } catch (e) {
        // console.error('Get User Error', e)
        req.user = null;
        next();
    }
}

module.exports = getUser;