const games = require('./Games')();
const queue = require('./Queue')();
const rooms = require('./Rooms')();

const socketio = require('socket.io');
const auth = require('./middleware/auth');
const ios = require('socket.io-express-session');

const updateSessionRoom = require('./updateSessionRoom');
const updateLeaderboard = require('./updateLeaderboard');

module.exports = (server, session) => {
    const io = socketio(server);
    // allows ws to access sessions
    io.use(ios(session));
    io.use(auth);

    io.on('connection', socket => {
        const roomID = socket.handshake.session.user.room;

        // if room exists in session, revert it to null
        if (roomID) updateSessionRoom(socket, null);

        socket.on('disconnect', () => {
            queue.remove(socket.id);

            const roomID = socket.handshake.session.user.room;

            if (!roomID && roomID !== 0) {
                return;
            }

            // if user  is in room, inform opponent
            if (rooms.exists(roomID)) {
                const opponent = rooms.getOpponentID(roomID, socket.id);

                if (opponent) {
                    const opponentSocket = io.sockets.sockets[opponent];

                    opponentSocket.leave(roomID);
                    rooms.close(roomID);

                    // reset socket to null
                    updateSessionRoom(opponentSocket, null);

                    // handle differently if opponent is in a game
                    if (games.exists(roomID)) {
                        games.close(roomID);
                        io.sockets.sockets[opponent].emit('game', { state: 'disconnect' });
                    } else if (rooms.state(roomID) === 'rematch') {
                        io.sockets.sockets[opponent].emit('game', { state: 'rematch_leave' });
                    } else {
                        io.sockets.sockets[opponent].emit('game', { state: 'opponent_left' });
                    }
                }
            }
        });

        socket.on('game', (data, cb) => {
            if (!data.hasOwnProperty('state')) return;
            const roomID = socket.handshake.session.user.room;

            if (data.state === 'rematch') {
                if (!rooms.exists(roomID) || rooms.state(roomID) !== 'rematch') {
                    if (cb) cb();
                    return;
                }

                const opponentID = rooms.getOpponentID(roomID, socket.id);

                rooms.accept(roomID, socket.id);
                const playerHasAccepted = rooms.playerHasAccepted(roomID, socket.id);

                if (!playerHasAccepted) {
                    io.sockets.sockets[opponentID].emit('game', { state: 'rematch_accept' });
                }

                if (rooms.bothPlayersAccepted(roomID)) {
                    // setup rematch

                    const players = [socket.id, opponentID];
                    const game = games.create(roomID, players);
                    io.to(roomID).emit('game', { state: 'ready', game });
                }

                if (cb) cb();
                return;
            }

            if (data.state === 'leave_rematch') {
                if (!rooms.exists(roomID) || rooms.state(roomID) !== 'rematch') {
                    if (cb) cb();
                    return;
                }

                const opponentID = rooms.getOpponentID(roomID, socket.id);

                io.sockets.sockets[opponentID].emit('game', { state: 'rematch_leave' });

                rooms.getPlayerIDs.forEach(player => {
                    const socket = io.sockets.sockets[player];
                    socket.leave(roomID);
                    updateSessionRoom(socket, null);
                });

                rooms.close(roomID);

                if (cb) cb();
                return;
            }

            if (data.state === 'reject_rematch') {
                if (!rooms.exists(roomID) || rooms.state(roomID) !== 'rematch') {
                    if (cb) cb();
                    return;
                }

                const opponentID = rooms.getOpponentID(roomID, socket.id);

                io.sockets.sockets[opponentID].emit('game', { state: 'rematch_reject' });

                rooms.getPlayerIDs(roomID).forEach(player => {
                    const socket = io.sockets.sockets[player];
                    socket.leave(roomID);
                    updateSessionRoom(socket, null);
                });

                rooms.close(roomID);

                if (cb) cb();
                return;
            }

            if (data.state === 'join_queue') {
                // must not already be in queue

                const addedToQueue = queue.add(socket.id);
                if (cb) cb(addedToQueue);
                return;
            }

            if (data.state === 'leave_queue') {
                // must be in queue
                // room must be valid

                queue.remove(socket.id);
                // const room = socket.handshake.session.user.room;

                if (!roomID && roomID !== 0) {
                    if (cb) cb(false);
                    return;
                }

                // tell opponent that you've left
                const opponent = rooms.getOpponentID(roomID, socket.id);

                if (opponent) {
                    const opponentSocket = io.sockets.sockets[opponent];
                    const players = rooms.getPlayerIDs(roomID);

                    players.forEach(player => io.sockets.sockets[player].leave(roomID));
                    rooms.close(roomID);

                    updateSessionRoom(opponentSocket, null);

                    opponentSocket.emit('game', { state: 'opponent_left' });

                    if (cb) cb();
                }

                return;
            }

            if (data.state === 'accept') {
                // must be in room
                // room must be valid

                // const room = socket.handshake.session.user.room;

                if (!roomID && roomID !== 0) {
                    if (cb) cb(false);
                    return;
                }

                if (!rooms.exists(roomID)) {
                    if (cb) cb(false);
                    return;
                }

                // tell other player
                const opponent = rooms.getOpponentID(roomID, socket.id);
                io.sockets.sockets[opponent].emit('game', { state: 'accepted' });

                if (cb) cb();
                rooms.accept(roomID, socket.id);
                const bothAccepted = rooms.bothPlayersAccepted(roomID);

                if (bothAccepted) {
                    const players = [socket.id, rooms.getOpponentID(roomID, socket.id)];
                    const game = games.create(roomID, players);

                    players.map(player => updateSessionRoom(io.sockets.sockets[player], roomID));

                    io.to(roomID).emit('game', { state: 'ready', game });
                }

                return;
            }

            if (data.state === 'submit_turn') {
                // must be in room
                // room must be valid
                // turn must be valid
                // must be current players turn

                // const room = socket.handshake.session.user.room;

                if (!roomID && roomID !== 0) {
                    if (cb) cb(false);
                    return;
                }

                if (!rooms.exists(roomID)) {
                    if (cb) cb(false);
                    return;
                }

                // validate turn
                if (!games.isPlayersTurn(roomID, socket.id)) {
                    // invalid player
                    if (cb) cb(false);
                    return;
                }

                if (!games.isValidMove(roomID, data.move)) {
                    // invalid move
                    if (cb) cb(false);
                    return;
                }

                const updatedGame = games.update(roomID, data.move);

                if (updatedGame.won) {
                    games.close(roomID);
                    rooms.reset(roomID);

                    // update leaderboard
                    const users = updatedGame.players.map(player => ({
                        sessionID: player.id,
                        id: io.sockets.sockets[player.id].handshake.session.user.id,
                    }));

                    updateLeaderboard(updatedGame.won, socket.id, users).then(() => {
                        io.to(roomID).emit('game', {
                            state: 'win',
                            winType: updatedGame.won,
                            player: socket.id,
                            game: { ...updatedGame, currentPlayer: socket.id }, // game updated player, but current player has won
                        });
                    });
                } else {
                    io.to(roomID).emit('game', { state: 'new_turn', game: updatedGame });
                }

                return;
            }
        });
    });

    queue.subscribe(currentQueue => {
        if (currentQueue.length >= 2) {
            // add new room object, and subscibe those users to that room object

            const players = queue.getPlayers();

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

            const roomID = rooms.join(users);

            // players contain the socketid's
            // Add the players to the room

            players.map(player => {
                const socket = io.sockets.sockets[player];
                updateSessionRoom(socket, roomID);
                socket.join(roomID);
            });

            // const users = rooms.getUsers(roomID);

            setTimeout(() => io.to(roomID).emit('game', { state: 'found', players: users }));
        }
    });
};
