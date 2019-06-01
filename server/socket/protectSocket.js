const protectSocket = (socket, next) => {
    if (!socket.handshake.session.user) return next(new Error('No session'));
    next();
};

module.exports = protectSocket;