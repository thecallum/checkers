const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const setupDatabase = require('./db/setup');

const app = express();
const PORT = 4000 || process.env.PORT;

const path = require('path');
const fileName = path.basename(__filename);

const server = require('http').createServer(app);

const setupSession = require('./setupSession');
var ios = require('socket.io-express-session');

module.exports = async () => {
    await setupDatabase();
    const session = setupSession(app);

    const io = require('./socket/io')(server);
    io.use(ios(session));

    const handleSocket = require('./socket/handleSocket');
    handleSocket(io);

    app.set('view engine', 'ejs');
    app.set('view options', { rmWhitespace: true });

    app.use(helmet())
    app.use(bodyParser());
    
    app.use('/js/', express.static('public/js/'));
    app.use('/css/', express.static('public/css/'));
    app.use('/assets/', express.static('public/assets/'));

    app.use(require('./routes/data'));  
    app.use(require('./routes/auth'));  
    app.use(require('./routes/pages'));  
    
    server.listen(PORT, () => console.log(`${fileName} is running on https://localhost:${PORT}`));
}