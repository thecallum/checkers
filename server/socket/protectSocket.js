const cookieParser = require('cookie-parser');
const cookie = require('cookie');

const getCookie = (name, thecookie) => {
    try {
        let cookies = cookie.parse(thecookie);
        cookies = cookieParser.signedCookies(cookies, process.env.COOKIE_SECRET);

        cookies = cookies[name];

        cookies = JSON.parse(cookies);

        return cookies;
    } catch(e) {
        return false;
    }
}

const protectSocket = (socket, next) => {
    const data = socket.request;

    if (!data.headers.cookie) return next(new Error('No cookie given.'));

    const sessionId__cookie = getCookie('sessionId', data.headers.cookie);

    if (!sessionId__cookie) return next(new Error('Invalid cookie'));

    socket.request.user = sessionId__cookie;
    
    next();
};

module.exports = protectSocket;