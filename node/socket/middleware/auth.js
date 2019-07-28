module.exports = (socket, next) => {
    if (!socket.handshake.session.user) return next(new Error('No session'));
    socket.request.user = socket.handshake.session.user;
    next();
};
