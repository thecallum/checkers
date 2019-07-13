const updateSessionRoom = require('./updateSessionRoom');

module.exports = (players, rooms, io) => {
    const users = {
        [players[1]]: {
            username: io.sockets.sockets[players[1]].handshake.session.user.username,
            src: io.sockets.sockets[players[1]].handshake.session.user.profile_image,
        },
        [players[0]]: {
            username: io.sockets.sockets[players[0]].handshake.session.user.username,
            src: io.sockets.sockets[players[0]].handshake.session.user.profile_image,
        },
    };

    const room = rooms.join({
        players: {
            [players[0]]: {
                accepted: false,
                ...users[players[0]],
            },
            [players[1]]: {
                accepted: false,
                ...users[players[1]],
            },
        },
    });

    // players contain the socketid's
    // Add the players to the room

    players.map(player => {
        const socket = io.sockets.sockets[player];
        updateSessionRoom(socket, room);
        socket.join(room);
    });

    return room;
};
