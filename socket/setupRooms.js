const setupRooms = () => {
    let rooms = {};
    let roomIndex = 0;

    const join = data => {
        const id = roomIndex++;
        rooms[id] = {
            ...data
        };
        return id;
    }

    const close = roomID => delete rooms[roomID];

    const accept = (roomID, userID) => {
        rooms[roomID].players[userID].accepted = true;

        const room = rooms[roomID];
        const accepted = Object.keys(room.players).filter(key => room.players[key].accepted);

        return accepted.length === 2;
    }

    return {
        rooms,
        join,
        close,
        accept
    }
}

module.exports = setupRooms;