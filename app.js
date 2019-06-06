if (!process.env.PORT) throw 'PORT UNDEFINED';

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const setupSession = require('./setupSession');
const controller = require('./socket/controller');

const app = express();
const session = setupSession();

app.set('view engine', 'ejs');
app.set('view options', { rmWhitespace: true });

app.use(helmet())
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(session);
app.use(express.static('node_modules'));
app.use(compression());

app.use('/js/', express.static('public/js/'));
app.use('/css/', express.static('public/css/'));
app.use('/assets/', express.static('public/assets/'));

app.use(require('./controllers/routes/data'));
app.use(require('./controllers/routes/auth'));
app.use(require('./controllers/routes/pages'));

const server = app.listen(process.env.PORT, () => console.log(`${ path.basename(__filename) } is running on https://localhost:${ process.env.PORT }`));

// start websocket controller;
controller(server, session);

module.exports = app;