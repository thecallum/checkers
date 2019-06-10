const setupGames = require('./setupGames');
const games = setupGames();

const setupQueue = require('./setupQueue');
const queue = setupQueue();

const setupRooms = require('./setupRooms');
const rooms = setupRooms();

const setupClients = require('./setupClients');
const clients = setupClients();

const socketio = require('socket.io');
const auth = require('./middleware/auth');
const ios = require('socket.io-express-session');

module.exports = (server, session) => {
    const io = socketio(server);
    // allows ws to access sessions
    io.use(ios(session));
    io.use(auth);

    io.on('connection', socket => {
        clients.add(socket);

        socket.on('disconnect', () => {
            queue.remove(socket.id);

            const room = clients.get(socket.id).room;

            if (room !== null) {
                const opponent = rooms.getOpponentID(room, socket.id);
                io.sockets.sockets[opponent].leave(room);
                rooms.close(room);

                clients.updateRoom(opponent, null);

                if (games.exists(room)) {
                    games.close(room);
                    io.sockets.sockets[opponent].emit('game', { state: 'disconnect' });
                } else {
                    io.sockets.sockets[opponent].emit('game', { state: 'opponent_left' });
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

                const room = clients.get(socket.id).room;

                if (room !== null) {
                    // tell opponent that you've left
                    const opponent = rooms.getOpponentID(room, socket.id);
                    const players = rooms.getPlayerIDs(room);
                    players.forEach(player => io.sockets.sockets[player].leave(room));
                    rooms.close(room);
                    clients.updateRoom(opponent, null);
                    io.sockets.sockets[opponent].emit('game', { state: 'opponent_left' });
                }

                cb();
            }

            if (data.state === 'accept') {
                const { room } = clients.get(socket.id);
                if (room === null) return;

                // tell other player
                const opponent = rooms.getOpponentID(room, socket.id);
                io.sockets.sockets[opponent].emit('game', { state: 'accepted' });

                const bothAccepted = rooms.accept(room, socket.id);

                if (!bothAccepted) return cb();

                // start game
                const players = rooms.getPlayerIDs(room);
                const game = games.create(room, players, socket.id);

                players.map(player => {
                    io.sockets.sockets[player].request.user = {
                        ...io.sockets.sockets[player].request.user,
                        roomIndex: room,
                    };
                });

                io.to(room).emit('game', { state: 'ready', game });
            }

            if (data.state === 'submit_turn') {
                const { room } = clients.get(socket.id);
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
        console.log('Queue update', currentQueue);

        if (currentQueue.length >= 2) {
            // add new room object, and subscibe those users to that room object
            const players = queue.getPlayers();
            const roomIndex = rooms.join({
                players: {
                    [players[0]]: {
                        accepted: false,
                        username: clients.get(players[0]).username,
                        src: '/',
                        alt: 'user pic',
                    },
                    [players[1]]: {
                        accepted: false,
                        username: clients.get(players[1]).username,
                        src: '/',
                        alt: 'user pic',
                    },
                },
            });

            console.log('new ROom', roomIndex);

            // players contain the socketid's
            // Add the players to the room

            players.map(player => {
                clients.updateRoom(player, roomIndex);
                io.sockets.sockets[player].join(roomIndex);
            });

            const gameData = {
                [players[0]]: { username: clients.get(players[0]).username },
                [players[1]]: { username: clients.get(players[1]).username },
            };

            setTimeout(() => {
                io.to(roomIndex).emit('game', {
                    state: 'found',
                    roomIndex,
                    data: gameData,
                });
            }, 0);
        }
    });
};
