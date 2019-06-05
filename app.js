console.time('Start Server');

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
// const compression = require('compression');
const setupSession = require('./setupSession');


// const socketio = require('./socket/io');

// const handleSocket = require('./socket/handleSocket');
const path = require('path');

const app = express();
const server = require('http').createServer(app);

if (!process.env.PORT) throw 'PORT UNDEFINED';

const session = setupSession();

// const io = socketio(server);

// handleSocket(io, session);

const socketIO = require('socket.io');

// let io;

// module.exports = server => {
const io = socketIO(server);
// return io;
// }



app.set('view engine', 'ejs');
app.set('view options', { rmWhitespace: true });

app.use(helmet())
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log('Request', req.url);
    next();
})

io.on('connection', socket => {
    console.log('SOCKETIO CONNECTION,', socket.id);

})

app.use(session);
app.use(express.static('node_modules'));
// app.use(compression());

// app.use()

app.use('/js/', express.static('public/js/'));
app.use('/css/', express.static('public/css/'));
app.use('/assets/', express.static('public/assets/'));

app.use(require('./controllers/routes/data'));
app.use(require('./controllers/routes/auth'));
app.use(require('./controllers/routes/pages'));

app.listen(process.env.PORT, () => console.log(`${ path.basename(__filename) } is running on https://localhost:${ process.env.PORT }`));

console.timeEnd('Start Server');

module.exports = app;