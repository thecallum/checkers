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

                io.to(roomID).emit('game', {
                    state: 'disconnect'
                })   
                
                // const otherPlayer = Object.keys(rooms[roomID].players).filter(id => id !== socket.id)[0];
                
                delete rooms[roomID];

                // queue.add(otherPlayer);

                // console.log('Disconnect, sending queue')
                
                // io.sockets.sockets[otherPlayer].emit('game', {
                //     state: 'queue'
                // })
            }

            // remove user
            delete clients[socket.id];

        })

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

                    const generatePieces = require('../../src/js/components/generatePieces');
                    const generateOptions = require('../../src/js/components/generateOptions');

                    const newPieces = generatePieces();
                    // console.log({ newPieces })
                    const newOptions = generateOptions(newPieces, 0);

                    // console.log('setup game', rooms[data.data.gameIndex]);
                    // console.log('CLients', clients)
                    // console.log(clients[socket.id], clients[otherPlayer])

                    const game = {
                        pieces: newPieces,
                        options: newOptions,
                        players: [
                            { id: socket.id, username: clients[otherPlayer].username },
                            { id: otherPlayer, username: clients[otherPlayer].username }
                            // { username: rooms[data.data.gameIndex].players[0], id: },
                            // {}
                            // rooms[data.data.gameIndex].players[0],
                            // rooms[data.data.gameIndex].players[1]
                        ],
                        currentPlayer: 0,   
                        clientUser: 0,
                    }

                    setTimeout(() => {
                        io.to(data.data.gameIndex).emit('game', { state: 'ready', game });
                    }, 100);
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

            // console.log('CLIENTS', clients[players[0]])

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

            // console.log(rooms[roomIndex])

        }


        // wait for players to accept

        /*
{
    [playerid]: false,
    [playerid]: false
}
        */
    


    });

}