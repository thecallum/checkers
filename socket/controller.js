const games = require('./setupGames')();
const queue = require('./setupQueue')();
const rooms = require('./setupRooms')();

const socketio = require('socket.io');
const auth = require('./middleware/auth');
const ios = require('socket.io-express-session');

const updateSessionRoom = (socket, newRoom) => {
    socket.handshake.session.user = { ...socket.handshake.session.user, room: newRoom };
    socket.handshake.session.save();
};

module.exports = (server, session) => {
    const io = socketio(server);
    // allows ws to access sessions
    io.use(ios(session));
    io.use(auth);

    const startGame = (room, userID, players) => {
        const game = games.create(room, players, userID);

        players.map(player => {
            const socket = io.sockets.sockets[player];
            updateSessionRoom(socket, room);
        });

        io.to(room).emit('game', {
            state: 'ready',
            game,
        });
    };

    io.on('connection', socket => {
        const room = socket.handshake.session.user.room;

        // console.log('CONNECT', { room });

        // if room exists in session, revert it to null
        if (room) updateSessionRoom(socket, null);

        socket.on('disconnect', () => {
            queue.remove(socket.id);

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

            if (data.state === 'join_queue') {
                // must not already be in queue

                const inQueue = queue.add(socket.id);
                if (cb) cb(inQueue);
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
                    startGame(room, socket.id, [socket.id, rooms.getOpponentID(room, socket.id)]);
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
                    console.log('INVALID PLAYER');
                    if (cb) cb(false);
                    return;
                }

                if (!games.isValidMove(room, data.move)) {
                    // invalid move
                    console.log('INVALID MOVE');
                    if (cb) cb(false);
                    return;
                }

                const updatedGame = games.update(room, data.move);

                if (updatedGame.won) {
                    games.close(room);

                    io.to(room).emit('game', {
                        state: 'win',
                        winType: updatedGame.gameWon,
                        player: socket.id,
                        game: { ...updatedGame, currentPlayer: socket.id }, // game updated player, but current player has won
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

            const room = rooms.join({
                players: {
                    [players[0]]: {
                        accepted: false,
                        username: io.sockets.sockets[players[0]].handshake.session.user.username,
                        src: '/',
                        alt: 'user pic',
                    },
                    [players[1]]: {
                        accepted: false,
                        username: io.sockets.sockets[players[1]].handshake.session.user.username,
                        src: '/',
                        alt: 'user pic',
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

            const users = {
                [players[1]]: {
                    username: io.sockets.sockets[players[1]].handshake.session.user.username,
                    src: 'http://orig11.deviantart.net/8fb6/f/2014/142/a/0/best_shrek_face_by_mrlorgin-d7jaspk.jpg',
                },
                [players[0]]: {
                    username: io.sockets.sockets[players[0]].handshake.session.user.username,
                    src: 'http://orig11.deviantart.net/8fb6/f/2014/142/a/0/best_shrek_face_by_mrlorgin-d7jaspk.jpg',
                },
            };

            setTimeout(() => {
                io.to(room).emit('game', { state: 'found', players: users });
            });
        }
    });
};
