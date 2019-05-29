const cookieParser = require('cookie-parser');
const cookie = require('cookie');

const setup_queue = () => {
    let queue = [];
    const subscribeList = [];

    const get = () => queue;

    const add = id => {
        queue.push(id);
        emit();
    };

    const getPlayers = () => {
        const spliced =  queue.splice(0,2);
        emit();
        return spliced;
    }

    const remove = id => {
        queue = queue.filter(userID => userID !== id);
        emit();
    }

    const subscribe = cb => subscribeList.push(cb);

    const emit = () => subscribeList.map(cb => cb(queue));

    return { queue, add, getPlayers, subscribe, remove, get };    
}

let roomID = 0;
const rooms = {};
const games = {};

const clients = {};
const queue = setup_queue();

const generatePieces = require('../../src/js/components/generatePieces');
const generateOptions = require('../../src/js/components/generateOptions');
const updatePieces = require('../../src/js/components/updatePieces');
const nextPlayer = require('../../src/js/components/nextPlayer');

module.exports = io => {
    io.use((socket, next) => {
        const data = socket.request;

        if (!data.headers.cookie) return next(new Error('No cookie given.'));

        const getCookie = name => {
            try {
                let cookies = cookie.parse(data.headers.cookie);
                cookies = cookieParser.signedCookies(cookies, process.env.COOKIE_SECRET);
        
                cookies = cookies[name];
                cookies = JSON.parse(cookies);
    
                return cookies;
            } catch(e) {
                return false;
            }
        }

        // const cookies = cookieParser.signedCookies(data.headers.cookie)
        const sessionId__cookie = getCookie('sessionId');

        if (!sessionId__cookie) return next(new Error('Invalid cookie'));

        socket.request.user = sessionId__cookie;
        
        next();
    });

    io.on('connection', socket => {
        console.log('SOCKETIO CONNECTION');
        
        // connect client 
        clients[socket.id] = { ...socket.request.user, room: null };
        
        socket.on('disconnect', () => {
            console.log('SOCKET DISCONNECT')
            // if in queue, remove
            queue.remove(socket.id);
        
            // if in room, remove
            // return;

            if (clients[socket.id].hasOwnProperty('room')) {
                // client is in a room, must disconnect other player
                const roomID = clients[socket.id].room;

                io.to(roomID).emit('game', { state: 'disconnect' });
                                
                delete rooms[roomID];
            }

            // remove user
            delete clients[socket.id];
        });

        socket.on('game', data => {

            if (!data.hasOwnProperty('state')) return;

            if (data.state === 'join_queue') {
                socket.emit('game', { state: 'queue' });
                queue.add(socket.id);
            }

            if (data.state === 'accept') {
                rooms[data.data.gameIndex].players[socket.id].accepted = true;

                // check if other player has accepted

                const otherPlayer = Object.keys(rooms[data.data.gameIndex].players).filter(id => id !== socket.id)[0];

                io.sockets.sockets[otherPlayer].emit('game', { state: 'accepted' });

                if (rooms[data.data.gameIndex].players[otherPlayer].accepted) {
                    // BOTH PLAYERS HAVE ACCEPTED!
                    // start game

                    const players = [
                        socket.id,
                        otherPlayer
                    ];

                    const newPieces = generatePieces(socket.id, otherPlayer);
                    const newOptions = generateOptions(newPieces, socket.id, players);

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

                    io.sockets.sockets[otherPlayer].request.user = {
                        ...io.sockets.sockets[otherPlayer].request.user,
                        roomIndex: data.data.gameIndex
                    }

                    io.to(data.data.gameIndex).emit('game', { state: 'ready', game });
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

                    

                    // endturn()

                    const checkWin = (newPieces, newPlayer, newOptions) => {

                        const opponentHasPieces = newPieces.filter(piece => piece.player === newPlayer).length > 0;

                        if (!opponentHasPieces) {
                            // this.handleGameEnd('win');
                            console.log('GAME END, OPPONENT HAS NO MORE PIECES')
                            return 'Opponent has no pieces';
                        } 

                        let opponentHasOptions = false;
                        for (let option of Object.keys(newOptions)) {
                            const currentOption = newOptions[option];
            
                            if (currentOption.length > 0) {
                                opponentHasOptions = true;
                                break;
                            }
                        }

                        if (!opponentHasOptions) {
                            // this.handleGameEnd('draw');
                            console.log('GAME END, OPPONENT HAS NO MORE OPTIONS')
                            return 'Opponent has no options -- draw';
                        }

                    }

                    

                    const gameWon = checkWin(newPieces, newPlayer, newOptions);
        
                    if (!!gameWon) {
                        delete games[roomIndex];

                        io.to(roomIndex).emit('game', { 
                            state: 'win', 
                            data: {
                                type: 'win',
                                player: socket.id,
                                message: 'Player won!'
                            }
                        });

                    } else {
                        games[roomIndex] =  {
                            ...game,
                            pieces: newPieces,
                            options: newOptions,
                            selectedPiece: null,
                            currentPlayer: newPlayer,
                        }; 
            
    
                        io.to(roomIndex).emit('game', { 
                            state: 'new_turn', 
                            data: {
                                game: games[roomIndex]
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
            const roomIndex = roomID++;

            rooms[roomIndex] = {
                players: {
                    [players[0]] : {
                        accepted: false,
                        username: clients[players[0]].username,
                    },
                    [players[1]] : {
                        accepted: false,
                        username: clients[players[1]].username,
                    },
                }
            }

            // players contain the socketid's
            // Add the players to the room

            players.map(player => {
                io.sockets.sockets[player].join(roomIndex);
                clients[player] = {
                    ...clients[player],
                    room: roomIndex
                }
            });

            io.to(roomIndex).emit('game', {
                state: 'found',
                roomIndex,
                data: {
                    [players[0]] : {
                        username: clients[players[0]].username,
                    },
                    [players[1]] : {
                        username: clients[players[1]].username,
                    },
                }
            })
        }
    });
}