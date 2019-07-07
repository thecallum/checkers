const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');

const getLeaderboard = require('../getLeaderboard');

router.get('/', (req, res) => {
    res.render('pages/index', { auth: !!req.session.user });
});

router.get('/login', (req, res) => {
    res.render('pages/login', { auth: !!req.session.user });
});

router.get('/register', (req, res) => {
    res.render('pages/register', { auth: !!req.session.user });
});

router.get('/profile', auth, (req, res) => {
    res.render('pages/profile', {
        auth: !!req.session.user,
        username: req.session.user.username,
        email: req.session.user.email,
        img: req.session.user.profile_image,
    });
});

router.get('/play/singleplayer', (req, res) => {
    res.render('pages/playSinglePlayer', { auth: !!req.session.user });
});

router.get('/play/multiplayer', (req, res) => {
    res.render('pages/playMultiPlayer', { auth: !!req.session.user });
});

router.get('/play/online', auth, (req, res) => {
    res.render('pages/playOnline', { auth: !!req.session.user });
});

router.get('/leaderboard', (req, res) => {
    getLeaderboard()
        .then(response =>
            res.render('pages/leaderboard', {
                auth: !!req.session.user,
                ...response,
                error: false,
            })
        )
        .catch(err => {
            console.log({ err });
            res.render('pages/leaderboard', { auth: !!req.session.user, error: true });
        });
});

router.get('*', (req, res) => {
    res.render('pages/pageNotFound', { auth: !!req.session.user });
});

module.exports = router;
