console.time('Start Server');

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const setupSession = require('./setupSession');

const socketio = require('./socket/io');
var ios = require('socket.io-express-session');

const handleSocket = require('./socket/handleSocket');
const path = require('path');

const app = express();
const server = require('http').createServer(app);

if (!process.env.PORT) throw 'PORT UNDEFINED';

const session = setupSession();

const io = socketio(server);
io.use(ios(session));
handleSocket(io);

app.set('view engine', 'ejs');
app.set('view options', { rmWhitespace: true });

app.use(helmet())
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(session);

app.use('/js/', express.static('public/js/'));
app.use('/css/', express.static('public/css/'));
app.use('/assets/', express.static('public/assets/'));

app.use(require('./controllers/routes/data'));
app.use(require('./controllers/routes/auth'));
app.use(require('./controllers/routes/pages'));

console.timeEnd('Start Server');

module.exports = app;
module.exports.server = app.listen(process.env.PORT, () => console.log(`${ path.basename(__filename) } is running on https://localhost:${ process.env.PORT }`));