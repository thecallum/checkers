const Rooms = () => {
    let rooms = {};
    let roomIndex = 0;

    const join = users => {
        const roomID = roomIndex++;

        const players = Object.keys(users);

        rooms[roomID] = {
            players: {
                [players[0]]: { ...users[players[0]], accepted: false },
                [players[1]]: { ...users[players[1]], accepted: false },
            },
            state: 'game', // 'game' | 'rematch'
        };

        return roomID;
    };

    const reset = roomID => {
        const players = Object.keys(rooms[roomID].players);

        rooms[roomID] = {
            players: {
                [players[0]]: { ...rooms[roomID][players[0]], accepted: false },
                [players[1]]: { ...rooms[roomID][players[1]], accepted: false },
            },
            state: 'rematch',
        };
    };

    const close = roomID => delete rooms[roomID];

    const accept = (roomID, userID) => {
        rooms[roomID].players[userID].accepted = true;
    };

    const playerHasAccepted = (roomID, playerID) => rooms[roomID].players[playerID].accept;

    const bothPlayersAccepted = roomID => getPlayerIDs(roomID).filter(key => rooms[roomID].players[key].accepted).length === 2;

    const getPlayerIDs = roomID => Object.keys(rooms[roomID].players);

    const getOpponentID = (roomID, userID) => {
        if (!exists(roomID)) return false;
        return Object.keys(rooms[roomID].players).filter(id => id !== userID)[0];
    };

    const exists = roomID => !!rooms.hasOwnProperty(roomID);

    const state = roomID => {
        if (!rooms.hasOwnProperty(roomID)) return false;
        return rooms[roomID].state;
    };

    const getUsers = roomID => rooms[roomID].players;

    return { join, close, accept, getPlayerIDs, playerHasAccepted, getOpponentID, exists, state, getUsers, bothPlayersAccepted, reset };
};

module.exports = Rooms;
