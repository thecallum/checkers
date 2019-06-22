const express = require('express');
const router = express.Router();

const updateUsername = require('../updateUsername');
const updateEmail = require('../updateEmail');

const auth = require('../../middleware/auth');

router.post('/user/update/username', auth, (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).send();

    const { id } = req.session.user;

    updateUsername(username, id)
        .then(() => {
            req.session.user = { ...req.session.user, username };
            req.session.save();

            res.status(200).send();
        })
        .catch(err => {
            res.status(400).json({ message: err === 'ER_DUP_ENTRY' ? 'Duplicate' : undefined });
        });
});

router.post('/user/update/email', auth, (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).send();
    const { id } = req.session.user;

    updateEmail(email, id)
        .then(() => {
            req.session.user = { ...req.session.user, email };
            req.session.save();

            res.status(200).send();
        })
        .catch(err => {
            res.status(400).json({ message: err === 'ER_DUP_ENTRY' ? 'Duplicate' : undefined });
        });
});

module.exports = router;
