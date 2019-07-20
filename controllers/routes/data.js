const express = require('express');
const router = express.Router();

const checkUsernameAvailable = require('../checkUsernameAvailable');
const getLeaderboard = require('../getLeaderboard');
const logger = require('../../logger');

router.post('/data/usernames/', async (req, res) => {
    try {
        const { username } = req.body;

        // must receive username to check
        if (!username) return res.status(400).send();

        const exists = await checkUsernameAvailable(username);
        res.status(200).json({ exists });
    } catch (e) {
        logger.error(e);
        res.status(500).send();
    }
});

router.post('/data/leaderboard/', (req, res) => {
    try {
        const { offset } = req.body;

        getLeaderboard(offset === undefined ? 0 : offset)
            .then(response => res.status(200).json({ ...response, error: false }))
            .catch(err => {
                throw err;
            });
    } catch (e) {
        logger.error(e);
        res.status(200).send();
    }
});

module.exports = router;
