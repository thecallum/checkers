const games = require('./Games')();
const queue = require('./Queue')();
const rooms = require('./Rooms')();
const rematch = require('./Rematch')();

const socketio = require('socket.io');
const auth = require('./middleware/auth');
const ios = require('socket.io-express-session');

const updateSessionRoom = require('./updateSessionRoom');
const updateLeaderboard = require('./updateLeaderboard');
const joinRoom = require('./joinRoom');

module.exports = (server, session) => {
    const io = socketio(server);
    // allows ws to access sessions
    io.use(ios(session));
    io.use(auth);

    io.on('connection', socket => {
        const room = socket.handshake.session.user.room;

        // if room exists in session, revert it to null
        if (room) updateSessionRoom(socket, null);

        socket.on('disconnect', () => {
            queue.remove(socket.id);
            const rematchOpen = rematch.findKey(socket.id);
            if (rematchOpen) {
                const opponentID = rematch.getOpponentID(socket.id);
                // close
                rematch.close(socket.id);
                // opponentID ==>> send opponent rejected rematch message
                io.sockets.sockets[opponentID].emit('game', { state: 'rematch_leave' });
            }

            const room = socket.handshake.session.user.room;

            if (!room && room !== 0) {
                return;
            }

            // if user  is in room, inform opponent
            if (rooms.exists(room)) {
                const opponent = rooms.getOpponentID(room, socket.id);

                if (opponent) {
                    const opponentSocket = io.sockets.sockets[opponent];

                    opponentSocket.leave(room);
                    rooms.close(room);

                    // reset socket to null
                    updateSessionRoom(opponentSocket, null);

                    // handle differently if opponent is in a game
                    if (games.exists(room)) {
                        games.close(room);
                        io.sockets.sockets[opponent].emit('game', { state: 'disconnect' });
                    } else {
                        io.sockets.sockets[opponent].emit('game', { state: 'opponent_left' });
                    }
                }
            }
        });

        socket.on('game', (data, cb) => {
            if (!data.hasOwnProperty('state')) return;

            if (data.state === 'rematch') {
                if (rematch.findKey(socket.id) === undefined) {
                    if (cb) cb();
                    return;
                }

                const opponentID = rematch.getOpponentID(socket.id);

                const hasAccepted = rematch.accept(socket.id);

                if (!hasAccepted) {
                    io.sockets.sockets[opponentID].emit('game', { state: 'rematch_accept' });
                }

                if (rematch.bothAccepted(socket.id)) {
                    // setup rematch

                    const players = [socket.id, opponentID];
                    const room = joinRoom(players, rooms, io);
                    const game = games.create(room, players);
                    players.map(player => updateSessionRoom(io.sockets.sockets[player], room));
                    io.to(room).emit('game', { state: 'ready', game });
                    rematch.close(socket.id);
                }

                if (cb) cb();
                return;
            }

            if (data.state === 'leave_rematch') {
                if (rematch.findKey(socket.id) === undefined) {
                    if (cb) cb();
                    return;
                }

                const opponentID = rematch.getOpponentID(socket.id);

                io.sockets.sockets[opponentID].emit('game', { state: 'rematch_leave' });

                rematch.close(socket.id);

                if (cb) cb();
                return;
            }

            if (data.state === 'reject_rematch') {
                if (rematch.findKey(socket.id) === undefined) {
                    if (cb) cb();
                    return;
                }

                const opponentID = rematch.getOpponentID(socket.id);

                io.sockets.sockets[opponentID].emit('game', { state: 'rematch_reject' });

                rematch.close(socket.id);

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
                const room = socket.handshake.session.user.room;

                if (!room && room !== 0) {
                    if (cb) cb(false);
                    return;
                }

                // tell opponent that you've left
                const opponent = rooms.getOpponentID(room, socket.id);

                if (opponent) {
                    const opponentSocket = io.sockets.sockets[opponent];
                    const players = rooms.getPlayerIDs(room);

                    players.forEach(player => io.sockets.sockets[player].leave(room));
                    rooms.close(room);

                    updateSessionRoom(opponentSocket, null);

                    opponentSocket.emit('game', { state: 'opponent_left' });

                    if (cb) cb();
                }

                return;
            }

            if (data.state === 'accept') {
                // must be in room
                // room must be valid

                const room = socket.handshake.session.user.room;

                if (!room && room !== 0) {
                    if (cb) cb(false);
                    return;
                }

                if (!rooms.exists(room)) {
                    if (cb) cb(false);
                    return;
                }

                // tell other player
                const opponent = rooms.getOpponentID(room, socket.id);
                io.sockets.sockets[opponent].emit('game', { state: 'accepted' });

                if (cb) cb();
                const bothAccepted = rooms.accept(room, socket.id);

                if (bothAccepted) {
                    const players = [socket.id, rooms.getOpponentID(room, socket.id)];
                    const game = games.create(room, players);

                    players.map(player => updateSessionRoom(io.sockets.sockets[player], room));

                    io.to(room).emit('game', { state: 'ready', game });
                }

                return;
            }

            if (data.state === 'submit_turn') {
                // must be in room
                // room must be valid
                // turn must be valid
                // must be current players turn

                const room = socket.handshake.session.user.room;

                if (!room && room !== 0) {
                    if (cb) cb(false);
                    return;
                }

                if (!rooms.exists(room)) {
                    if (cb) cb(false);
                    return;
                }

                // validate turn
                if (!games.isPlayersTurn(room, socket.id)) {
                    // invalid player
                    if (cb) cb(false);
                    return;
                }

                if (!games.isValidMove(room, data.move)) {
                    // invalid move
                    if (cb) cb(false);
                    return;
                }

                const updatedGame = games.update(room, data.move);

                if (updatedGame.won) {
                    games.close(room);
                    rematch.create(updatedGame.players[0].id, updatedGame.players[1].id);

                    // update leaderboard
                    const users = updatedGame.players.map(player => ({
                        sessionID: player.id,
                        id: io.sockets.sockets[player.id].handshake.session.user.id,
                    }));

                    updateLeaderboard(updatedGame.won, socket.id, users).then(() => {
                        io.to(room).emit('game', {
                            state: 'win',
                            winType: updatedGame.won,
                            player: socket.id,
                            game: { ...updatedGame, currentPlayer: socket.id }, // game updated player, but current player has won
                        });

                        updatedGame.players.forEach(player => io.sockets.sockets[player.id].leave(room));
                    });
                } else {
                    io.to(room).emit('game', {
                        state: 'new_turn',
                        game: updatedGame,
                    });
                }

                return;
            }
        });
    });

    queue.subscribe(currentQueue => {
        if (currentQueue.length >= 2) {
            // add new room object, and subscibe those users to that room object

            const players = queue.getPlayers();
            const room = joinRoom(players, rooms, io);
            const users = rooms.getUsers(room);

            setTimeout(() => io.to(room).emit('game', { state: 'found', players: users }));
        }
    });
};
