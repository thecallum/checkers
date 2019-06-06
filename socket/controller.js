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
            const client = clients.remove(socket, io);
            queue.remove(socket.id);

            if (client.hasOwnProperty('room')) {
                // client is in a room, must disconnect other player
                const roomID = client.room;
                rooms.close(roomID);
                io.to(roomID).emit('game', { state: 'disconnect' });
            }
        });

        socket.on('game', data => {
            if (!data.hasOwnProperty('state')) return;

            if (data.state === 'join_queue') {
                queue.add(socket.id);
                socket.emit('game', { state: 'queue' });
            }

            if (data.state === 'accept') {
                const id = data.data.gameIndex;
                const bothAccepted = rooms.accept(id, socket.id);

                if (!bothAccepted) return;

                // start game
                const players = rooms.getPlayerIDs(id);
                const game = games.create(id, players, socket.id);

                // set roomid to socket.request.user object
                players.map(player => {
                    io.sockets.sockets[player].request.user = {
                        ...io.sockets.sockets[player].request.user,
                        roomIndex: id
                    }
                });

                io.to(id).emit('game', { state: 'ready', game });
            }

            if (data.state === 'submit_turn') {
                const id = socket.request.user.roomIndex;
                const result = games.submitTurn(id, socket.id, data.data.move);
                if (!result) return;

                if (result.won) {
                    games.close(id);

                    io.to(id).emit('game', {
                        state: 'win',
                        data: {
                            type: result.gameWon,
                            player: socket.id,
                            message: 'It\'s a draw!',
                            game: {
                                ...result,
                                currentPlayer: socket.id // game updated player, but current player has won
                            }
                        }
                    });

                } else {
                    io.to(id).emit('game', {
                        state: 'new_turn',
                        data: {
                            game: result
                        }
                    });
                }
            }
        })
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
                        alt: 'user pic'
                    },
                    [players[1]]: {
                        accepted: false,
                        username: clients.get(players[1]).username,
                        src: '/',
                        alt: 'user pic'
                    },
                }
            })

            // players contain the socketid's
            // Add the players to the room

            players.map(player => {
                clients.updateRoom(player, roomIndex);
                io.sockets.sockets[player].join(roomIndex);
            });

            const gameData = {
                [players[0]]: { username: clients.get(players[0]).username },
                [players[1]]: { username: clients.get(players[1]).username }
            }

            io.to(roomIndex).emit('game', { state: 'found', roomIndex, data: gameData })
        }
    });
}