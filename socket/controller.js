const games = {};

const setupQueue = require('./setupQueue');
const queue = setupQueue();

const generatePieces = require('../src/js/components/generatePieces');
const generateOptions = require('../src/js/components/generateOptions');
const updatePieces = require('../src/js/components/updatePieces');
const nextPlayer = require('../src/js/components/nextPlayer');

const protectSocket = require('./middleware/protectSocket');
const ios = require('socket.io-express-session');

const setupRooms = require('./setupRooms');
const rooms = setupRooms();

const setupClients = require('./setupClients');
const clients = setupClients();

const socketio = require('socket.io');

module.exports = (server, session) => {
    const io = socketio(server);
    // allows ws to access sessions
    io.use(ios(session));
    io.use(protectSocket);

    io.on('connection', socket => {
        clients.add(socket);

        socket.on('disconnect', () => {
            const client = clients.remove(socket, io);

            queue.remove(socket.id);

            if (client.hasOwnProperty('room')) {
                // client is in a room, must disconnect other player
                const roomID = client.room;
                rooms.close(roomID);

                // set other player room property to null

                io.to(roomID).emit('game', {
                    state: 'disconnect'
                });

            }
        });

        socket.on('game', data => {

            if (!data.hasOwnProperty('state')) return;

            if (data.state === 'join_queue') {
                socket.emit('game', {
                    state: 'queue'
                });
                queue.add(socket.id);
            }

            if (data.state === 'accept') {
                const bothAccepted = rooms.accept(data.data.gameIndex, socket.id);

                if (bothAccepted) {
                    // BOTH PLAYERS HAVE ACCEPTED!
                    // start game

                    const players = Object.keys(rooms.rooms[data.data.gameIndex].players);

                    const newPieces = generatePieces(players[0], players[1]);
                    const newOptions = generateOptions(newPieces, players[0], players);

                    const game = {
                        pieces: newPieces,
                        options: newOptions,
                        players,
                        currentPlayer: socket.id
                    }

                    games[data.data.gameIndex] = game;

                    // set roomid to socket.request.user object

                    socket.request.user = {
                        ...socket.request.user,
                        roomIndex: data.data.gameIndex
                    }

                    io.sockets.sockets[players[1]].request.user = {
                        ...io.sockets.sockets[players[1]].request.user,
                        roomIndex: data.data.gameIndex
                    }

                    io.to(data.data.gameIndex).emit('game', {
                        state: 'ready',
                        game
                    });
                }
            }

            if (data.state === 'submit_turn') {
                // player has made turn

                // check that correct player made the mode
                // and that the move is a valid option
                const roomIndex = socket.request.user.roomIndex;

                if (socket.id !== games[roomIndex].currentPlayer) return;

                const selectedOption = data.data.move.selectedOption;
                const selectedOptionID = data.data.move.selectedPiece;

                const game = games[roomIndex];

                if (game.won) return console.log('GAME ALREADY WON, CANNOT MAKE ANOTHER MOVE');

                const gameOptions = game.options[selectedOptionID];

                if (gameOptions.length === 0) return;

                let validOption = false;

                for (let option of gameOptions) {
                    if (JSON.stringify(option) === JSON.stringify(selectedOption)) {
                        validOption = true;
                        break;
                    }
                }

                if (validOption) {
                    const newPieces = updatePieces(selectedOption, selectedOptionID, game.pieces, game.currentPlayer);
                    const newPlayer = nextPlayer(game.currentPlayer, games[roomIndex].players);
                    const newOptions = generateOptions(newPieces, newPlayer, games[roomIndex].players);

                    const checkWin = (newPieces, newPlayer, newOptions) => {
                        const opponentHasPieces = newPieces.filter(piece => piece.player === newPlayer).length > 0;
                        if (!opponentHasPieces) return 'win';

                        let opponentHasOptions = false;
                        for (let option of Object.keys(newOptions)) {
                            const currentOption = newOptions[option];

                            if (currentOption.length > 0) {
                                opponentHasOptions = true;
                                break;
                            }
                        }

                        if (!opponentHasOptions) return 'draw';

                        return false;
                    }


                    const gameWon = checkWin(newPieces, newPlayer, newOptions);

                    games[roomIndex] = {
                        ...game,
                        pieces: newPieces,
                        options: newOptions,
                        selectedPiece: null,
                        currentPlayer: newPlayer,
                        won: !!gameWon
                    };

                    const updatedGame = games[roomIndex];


                    if (gameWon) {
                        delete games[roomIndex];

                        console.log('GAME WON', gameWon)

                        io.to(roomIndex).emit('game', {
                            state: 'win',
                            data: {
                                type: gameWon,
                                player: socket.id,
                                message: 'It\'s a draw!',
                                game: {
                                    ...updatedGame,
                                    currentPlayer: socket.id
                                }
                            }
                        });

                    } else {
                        io.to(roomIndex).emit('game', {
                            state: 'new_turn',
                            data: {
                                game: updatedGame
                            }
                        });
                    }

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
                [players[0]]: {
                    username: clients.get(players[0]).username
                },
                [players[1]]: {
                    username: clients.get(players[1]).username
                },
            }

            io.to(roomIndex).emit('game', { state: 'found', roomIndex, data: gameData })
        }
    });
}