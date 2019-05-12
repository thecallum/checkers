const express = require('express');
const ejs = require('ejs');

const app = express();
const PORT = 4000;


module.exports = () => {
    app.set('view engine', 'ejs');
    app.set('view options', {
        rmWhitespace: true
    })

    app.get('/', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/index', {
            name: 'callum',
            auth: true
        });
    });
    app.get('/login', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/login', {
            name: 'callum',
            auth: true
        });
    });
    app.get('/register', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/register', {
            name: 'callum',
            auth: true
        });
    });
    app.get('/play/singleplayer', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/playSinglePlayer', {
            name: 'callum',
            auth: true
        });
    });
    app.get('/play/multiplayer', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/playMultiPlayer', {
            name: 'callum',
            auth: true
        });
    });
    app.get('/play/online', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/playOnline', {
            name: 'callum',
            auth: true
        });
    });
    app.get('/leaderboard', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/leaderboard', {
            name: 'callum',
            auth: true
        });
    });

    app.use(express.static('public'))

    app.get('*', (req, res) => {
        console.log('Request', req.url)
        // res.status(200).send('Hello, World!');
    
        res.render('pages/pageNotFound', {
            name: 'callum',
            auth: true
        });
    });    
    
    const path = require('path');
    app.listen(PORT, () => console.log(`${path.basename(__filename)} is running on https://localhost:${PORT}`));
}

