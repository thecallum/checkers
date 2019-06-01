const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const helmet = require('helmet');

// middleware
const getUser = require('./middleware/getUser');

const setupDatabase = require('./db/setup');

const app = express();
const PORT = 4000 || process.env.PORT;

const path = require('path');
const fileName = path.basename(__filename);

const server = require('http').createServer(app);

// const cookieEncryptor = require('cookie-encrypter');

module.exports = async () => {
    await setupDatabase();

    const io = require('./socket/io')(server);
    const handleSocket = require('./socket/handleSocket');
    handleSocket(io);

    app.set('view engine', 'ejs');
    app.set('view options', { rmWhitespace: true });

    app.use(helmet())
    app.use(bodyParser());
    app.use(cookieParser(process.env.COOKIE_SECRET));
    // app.use(cookieEncrypter(process.env.COOKIE_SECRET));

    app.use('/js/', express.static('public/js/'));
    app.use('/css/', express.static('public/css/'));
    app.use('/assets/', express.static('public/assets/'));

    app.use(require('./routes/data'));  
    
    app.use(getUser);    

    app.use(require('./routes/auth'));  
    app.use(require('./routes/pages'));  
    
    server.listen(PORT, () => console.log(`${fileName} is running on https://localhost:${PORT}`));
}