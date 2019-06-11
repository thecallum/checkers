const games = require('./setupGames')();
const queue = require('./setupQueue')();
const rooms = require('./setupRooms')();

const socketio = require('socket.io');
const auth = require('./middleware/auth');
const ios = require('socket.io-express-session');

module.exports = (server, session) => {
    const io = socketio(server);
    // allows ws to access sessions
    io.use(ios(session));
    io.use(auth);

    io.on('connection', socket => {
        const room = socket.handshake.session.user.room;

        if (!!room && !rooms.exists(room)) {
            socket.handshake.session.user = {
                ...socket.handshake.session.user,
                room: null,
            };
        }
        socket.on('disconnect', () => {
            queue.remove(socket.id);

            const room = socket.handshake.session.user.room;

            if (rooms.exists(room)) {
                const opponent = rooms.getOpponentID(room, socket.id);
                const opponentSocket = io.sockets.sockets[opponent];

                opponentSocket.leave(room);
                rooms.close(room);

                opponentSocket.handshake.session.user = { ...opponentSocket.handshake.session.user, room: null };
                socket.handshake.session.save();

                if (games.exists(room)) {
                    games.close(room);
                    io.sockets.sockets[opponent].emit('game', { state: 'disconnect' });
                }
            }
        });

        socket.on('game', (data, cb) => {
            if (!data.hasOwnProperty('state')) return;

            if (data.state === 'join_queue') {
                queue.add(socket.id);
                cb();
            }

            if (data.state === 'leave_queue') {
                queue.remove(socket.id);
                const room = socket.handshake.session.user.room;

                if (room !== null) {
                    // tell opponent that you've left
                    const opponent = rooms.getOpponentID(room, socket.id);
                    const opponentSocket = io.sockets.sockets[opponent];
                    const players = rooms.getPlayerIDs(room);

                    players.forEach(player => io.sockets.sockets[player].leave(room));
                    rooms.close(room);

                    opponentSocket.handshake.session.user = { ...opponentSocket.handshake.session.user, room: null };
                    socket.handshake.session.save();
                    opponentSocket.emit('game', { state: 'opponent_left' });
                }

                cb();
            }

            if (data.state === 'accept') {
                const room = socket.handshake.session.user.room;

                if (room === null) return;

                // tell other player
                const opponent = rooms.getOpponentID(room, socket.id);
                io.sockets.sockets[opponent].emit('game', { state: 'accepted' });

                const bothAccepted = rooms.accept(room, socket.id);

                if (!bothAccepted) return cb();

                // start game
                const players = [socket.id, rooms.getOpponentID(room, socket.id)];
                const game = games.create(room, players, socket.id);

                players.map(player => {
                    const socket = io.sockets.sockets[player];
                    socket.handshake.session.user = { ...socket.handshake.session.user, room };
                    socket.handshake.session.save();
                });

                io.to(room).emit('game', { state: 'ready', game });
            }

            if (data.state === 'submit_turn') {
                const room = socket.handshake.session.user.room;

                if (room === null) return;

                const result = games.submitTurn(room, socket.id, data.data.move);
                if (!result) return;

                if (result.won) {
                    games.close(room);

                    io.to(room).emit('game', {
                        state: 'win',
                        data: {
                            type: result.gameWon,
                            player: socket.id,
                            message: "It's a draw!",
                            game: {
                                ...result,
                                currentPlayer: socket.id, // game updated player, but current player has won
                            },
                        },
                    });
                } else {
                    io.to(room).emit('game', { state: 'new_turn', data: { game: result } });
                }
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
                socket.handshake.session.user = { ...socket.handshake.session.user, room };
                socket.handshake.session.save();

                socket.join(room);
            });

            const game = {
                [players[0]]: { username: io.sockets.sockets[players[0]].handshake.session.user.username },
                [players[1]]: { username: io.sockets.sockets[players[1]].handshake.session.user.username },
            };

            setTimeout(() => {
                io.to(room).emit('game', { state: 'found', game });
            }, 0);
        }
    });
};
