const express = require('express');
const router = express.Router();

const authenticateUser = require('../../controllers/authenticateUser');
const registerUser = require('../../controllers/registerUser');
const logger = require('../../logger');

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

router.post('/login', (req, res) => {
    try {
        const { email, password, stayLogged } = req.body;
        if (!email || !password) return res.status(400).send();

        authenticateUser(email, password)
            .then(user => {
                if (!user) return res.status(401).send();

                // login successful
                const sessionUser = { ...user, stayLogged, email, profile_image: user.profile_image };

                req.session.user = sessionUser;

                // If user has selected stayLogged, cookie will expire in 1 week
                if (stayLogged) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;

                req.session.save();

                res.status(200).send();
            })
            .catch(err => {
                throw err;
            });
    } catch (e) {
        logger.error(e);
        res.status(500).send();
    }
});

router.post('/register', (req, res) => {
    try {
        const { email, password, username, stayLogged } = req.body;
        if (!email || !password || !username) return res.status(400).send();

        registerUser(username, email, password)
            .then(({ success, newUser, message }) => {
                if (!success) {
                    // show message if the message isnt invalid
                    const body = { ...(message !== 'invalid' && { message }) };
                    return res.status(400).json(body);
                }

                // register successful
                const id = newUser.insertId;
                const sessionUser = { email, username, id, stayLogged };

                req.session.user = sessionUser;

                // If user has selected stayLogged, cookie will expire in 1 week
                if (stayLogged) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;

                req.session.save();

                res.status(200).send();
            })
            .catch(err => {
                throw err;
            });
    } catch (e) {
        logger.error(e);
        res.status(500).send();
    }
});

module.exports = router;
