const express = require('express');
const router = express.Router();

const protectedRoute = require('../middleware/protectedRoute');

router.get('/', (req, res) => {
    res.render('pages/index', { auth: !!req.user });
});

router.get('/login', (req, res) => {
    res.render('pages/login', { auth: !!req.user });
});

router.get('/register', (req, res) => {
    res.render('pages/register', { auth: !!req.user });
});

router.get('/profile', protectedRoute, (req, res) => {
    res.render('pages/profile', { auth: !!req.user, username: req.user.username, email: req.user.email });
});

router.get('/play/singleplayer', (req, res) => {
    res.render('pages/playSinglePlayer', { auth: !!req.user });
});

router.get('/play/multiplayer', (req, res) => {
    res.render('pages/playMultiPlayer', { auth: !!req.user });
});

router.get('/play/online', (req, res) => {
    res.render('pages/playOnline', { auth: !!req.user });
});

router.get('/leaderboard', (req, res) => {
    res.render('pages/leaderboard', { auth: !!req.user });
});  

router.get('*', (req, res) => {
    res.render('pages/pageNotFound', { auth: !!req.user });
});

module.exports = router;