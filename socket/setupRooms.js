const setupRooms = () => {
    let rooms = {};
    let roomIndex = 0;

    const join = data => {
        const id = roomIndex++;
        rooms[id] = { ...data };
        return id;
    };

    const close = roomID => delete rooms[roomID];

    const accept = (roomID, userID) => {
        const room = rooms[roomID];
        room.players[userID].accepted = true;
        const playersAccepted = getPlayerIDs(roomID).filter(key => room.players[key].accepted);
        return playersAccepted.length === 2;
    };

    const getPlayerIDs = id => Object.keys(rooms[id].players);

    const getOpponentID = (roomID, userID) => {
        if (rooms[roomID].players.length < 2) return false;
        return Object.keys(rooms[roomID].players).filter(id => id !== userID)[0];
    };

    const exists = id => !!rooms.hasOwnProperty(id);

    return { join, close, accept, getPlayerIDs, getOpponentID, exists };
};

module.exports = setupRooms;
