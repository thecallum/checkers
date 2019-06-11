console.time('Start Server');

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();

const server = require('http').createServer(app);

const setupSession = require('./setupSession');
var sharedSession = require('socket.io-express-session');

if (!process.env.PORT) throw 'PORT UNDEFINED';

const path = require('path');

const session = setupSession();
app.use(session);

const io = require('./socket/io')(server);
io.use(
    sharedSession(session, {
        autoSave: true,
    })
);

const handleSocket = require('./socket/handleSocket');
handleSocket(io);

app.set('view engine', 'ejs');
app.set('view options', {
    rmWhitespace: true,
});

app.use(helmet());
app.use(bodyParser());

app.use('/js/', express.static('public/js/'));
app.use('/css/', express.static('public/css/'));
app.use('/assets/', express.static('public/assets/'));

app.use(require('./routes/data'));

app.use(require('./routes/auth'));
app.use(require('./routes/pages'));

app.listen(process.env.PORT, () => console.log(`${path.basename(__filename)} is running on https://localhost:${process.env.PORT}`));
console.timeEnd('Start Server');

module.exports = app;
