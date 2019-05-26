const socketIO = require('socket.io');

let io;

module.exports = server => {
    io = socketIO(server);
    return io;
}