const setupClients = () => {
    const clients = {};

    const add = socket => clients[socket.id] = {...socket.request.user, room: null };

    const remove = (socket) => {
        console.log('SOCKET DISCONNECT');
        const client = clients[socket.id];
        delete clients[socket.id];
        return client;
    }

    const get = id => JSON.parse(JSON.stringify(clients[id]));

    const updateRoom = (id, room) => clients[id] = {...clients[id], room };

    return { add, remove, get, updateRoom }
}

module.exports = setupClients;