if (!process.env.PORT) throw 'PORT UNDEFINED';

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const logger = require('./logger');

const configureSession = require('./configureSession');
const configureCloudinary = require('./configureCloudinary');
const controller = require('./socket/controller');
const fileUpload = require('express-fileupload');

const app = express();
const session = configureSession();

configureCloudinary();

app.set('view engine', 'ejs');
app.set('view options', { rmWhitespace: true });

app.use(helmet());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp',
        safeFileNames: true,
        preserveExtension: true,
    })
);

app.use(session);
app.use(express.static('node_modules'));
app.use(compression());

app.use('/js/', express.static('public/js/'));
app.use('/css/', express.static('public/css/'));
app.use('/assets/', express.static('public/assets/'));

app.use(require('./controllers/routes/data'));
app.use(require('./controllers/routes/user'));
app.use(require('./controllers/routes/auth'));
app.use(require('./controllers/routes/pages'));

const server = app.listen(process.env.PORT, () => {
    console.log(`${path.basename(__filename)} is running on https://localhost:${process.env.PORT}`);
    logger.info('Server started');
});

module.exports = { app, server };

// start websocket controller;
controller(server, session);
