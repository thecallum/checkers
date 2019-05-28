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
const gameUnconfirmed = {};
let unconfirmedIndex = 0;

const generatePieces = require('../../src/js/components/generatePieces');
const generateOptions = require('../../src/js/components/generateOptions');

const { Piece } = require('../../src/js/components/piece');

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
        
        console.log('SOCKET USER', socket.request.user)
        // connect client 
        clients[socket.id] = { ...socket.request.user, room: null };
        
        socket.on('disconnect', () => {
            console.log('SOCKET DISCONNECT')
            // if in queue, remove
            queue.remove(socket.id);
        
            // if in room, remove
            // return;

            if (clients[socket.id].hasOwnProperty('room')) {
                console.log('in room')
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
                console.log('Player joined queue');

                socket.emit('game', { state: 'queue' });
                queue.add(socket.id);
            }

            if (data.state === 'accept') {
                console.log('Player is accepting game');
                console.log('game', data);

                rooms[data.data.gameIndex].players[socket.id].accepted = true;

                // check if other player has accepted

                const otherPlayer = Object.keys(rooms[data.data.gameIndex].players).filter(id => id !== socket.id)[0];

                io.sockets.sockets[otherPlayer].emit('game', {
                    state: 'accepted'
                });

                if (rooms[data.data.gameIndex].players[otherPlayer].accepted) {
                    // BOTH PLAYERS HAVE ACCEPTED!
                    // start game

                    // const newPlayer = game.currentPlayer === socket.id ? 1 : 0;

                    console.log('ACCEPT', rooms[data.data.gameIndex].players)

                    const players = [
                        socket.id,
                        otherPlayer
                    ];

                    const newPieces = generatePieces(socket.id, otherPlayer);
                    const newOptions = generateOptions(newPieces, socket.id, players);

                    

                    // console.log({ newOptions })

                    const game = {
                        pieces: newPieces,
                        options: newOptions,
                        // players: {
                        //     [socket.id]: { username: clients[otherPlayer].username },
                        //     [otherPlayer]: { username: clients[otherPlayer].username }
                        // },
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

                    setTimeout(() => {
                        io.to(data.data.gameIndex).emit('game', { state: 'ready', game });
                    }, 200);
                }
            }

            if (data.state === 'submit_turn') {
               // player has made turn
               
               // check that correct player made the mode
               // and that the move is a valid option

            //    console.log('Submit TUrn');

               const selectedOption = data.data.move.selectedOption;
               const selectedOptionID = data.data.move.selectedPiece;

               const roomIndex = socket.request.user.roomIndex;

               const game = games[roomIndex];

            //    console.log('Selected Option', selectedOption);

            //    console.log('Option in game', game.options[selectedOptionID]);

               const gameOptions = game.options[selectedOptionID];

               if (gameOptions.length === 0) {
                   // error: invalid option sent
               }

               let validOption = false;

            //    console.log({ gameOptions })

               for (let option of gameOptions) {
                //    console.log({ option })
                   if (JSON.stringify(option) === JSON.stringify(selectedOption)) {
                       validOption = true;
                       break;
                   }
               }

            //    console.log({ validOption });

               if (validOption) {
                   const handleSelection = (selectedOption, selectedOptionID, currentPlayer, players) => {
                    //    console.log('HANDLE SELECTION', selectedOption)
                       const kill = selectedOption.hasOwnProperty('kill');
                       const becomeKing = selectedOption.becomeKing;

                       const newPieces = game.pieces.filter(piece => {
                           // remove killed piece
                           return !(kill && piece.id === selectedOption.kill.id)
                       }).map(piece => {
                        //    console.log({ piece })
                           if (piece.id === selectedOptionID) {
                               
                               return new Piece(selectedOption.end, game.currentPlayer, piece.id, piece.king || becomeKing, piece.color);
                           }
                           return piece;
                       });

                    //    const otherPlayer = Object.keys(rooms[data.data.gameIndex].players).filter(id => id !== socket.id)[0];
                       

                    //    const newPlayer = game.currentPlayer === socket.id ? socket.id : 0;

                        const newPlayer = currentPlayer === players[0] ? players[1] : players[0];

                        console.log({ newPlayer, currentPlayer})
                    //    console.log('PLAYER', socket.id, 'CURRENT', game.currentPlayer, 'newPlayer', newPlayer)
                       const newOptions = generateOptions(newPieces, newPlayer, players);

                       return {
                           ...game,
                           pieces: newPieces,
                           options: newOptions,
                           selectedPiece: null,
                           currentPlayer: newPlayer,
                       };

                   }

                   const otherPlayer = Object.keys(rooms[roomIndex].players).filter(id => id !== socket.id)[0];
                   
                //    const players = [
                //        socket.id,
                //        otherPlayer
                //    ]

                   games[roomIndex] = handleSelection(selectedOption, selectedOptionID, game.currentPlayer, games[roomIndex].players);
                   

                //    console.log('UPDATEDGAME', games[roomIndex]);

                   io.to(roomIndex).emit('game', { 
                       state: 'new_turn', 
                       data: {
                           game: games[roomIndex]
                       }
                    });
                   

               }



            //    console.log('rooms', rooms[roomIndex]);

            //    console.log('Games', games[roomIndex])
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

            console.log('send found')
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

            console.log('Setup new room, waiting for players to confirm');

        }
    });
}