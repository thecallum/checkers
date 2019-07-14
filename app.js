if (!process.env.PORT) throw 'PORT UNDEFINED';

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const setupSession = require('./setupSession');
const controller = require('./socket/controller');
const fileUpload = require('express-fileupload');

const app = express();
const session = setupSession();

if (!process.env.cloud_name) throw 'Missing env variable cloud_name';
if (!process.env.api_key) throw 'Missing env variable api_key';
if (!process.env.api_secret) throw 'Missing env variable api_secret';

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
});

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
        preserveExtension: 2,
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

const server = app.listen(process.env.PORT, () => console.log(`${path.basename(__filename)} is running on https://localhost:${process.env.PORT}`));

module.exports = { app, server };

// start websocket controller;
controller(server, session);
