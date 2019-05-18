const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const getUser = require('./middleware/getUser');
const helmet = require('helmet');

const app = express();
const PORT = 4000;

const path = require('path');
const fileName = path.basename(__filename);

const setupDatabase = require('./db/setup');

module.exports = async () => {
    await setupDatabase();

    app.set('view engine', 'ejs');
    app.set('view options', { rmWhitespace: true });

    app.use(helmet())
    app.use(bodyParser());
    app.use(cookieParser());

    app.use('/js/', express.static('public/js/'));
    app.use('/css/', express.static('public/css/'));
    app.use('/assets/', express.static('public/assets/'));

    app.use(getUser);    

    app.use(require('./routes/auth'));  
    app.use(require('./routes/pages'));  
    
    app.listen(PORT, () => console.log(`${fileName} is running on https://localhost:${PORT}`));
}