const updateSessionRoom = (socket, newRoom) => {
    socket.handshake.session.user = { ...socket.handshake.session.user, room: newRoom };
    socket.handshake.session.save();
};

module.exports = updateSessionRoom;
