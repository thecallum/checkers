const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const getLeaderboard = require('../getLeaderboard');
const logger = require('../../logger');

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
    try {
        res.render('pages/profile', {
            auth: !!req.session.user,
            username: req.session.user.username,
            email: req.session.user.email,
            img: req.session.user.profile_image,
        });
    } catch (e) {
        logger.error(e);
        res.status(500).send();
    }
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
    try {
        getLeaderboard()
            .then(response =>
                res.render('pages/leaderboard', {
                    ...response,
                    auth: !!req.session.user,
                    error: false,
                })
            )
            .catch(err => {
                throw err;
            });
    } catch (e) {
        logger.error(e);
        res.status(500).send();
    }
});

router.get('*', (req, res) => {
    res.render('pages/pageNotFound', { auth: !!req.session.user });
});

module.exports = router;
