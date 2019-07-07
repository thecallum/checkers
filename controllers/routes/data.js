const express = require('express');
const router = express.Router();

const { checkUsernameAvailable } = require('../../models/user');
const getLeaderboard = require('../getLeaderboard');

router.post('/data/usernames', async (req, res) => {
    const { username } = req.body;

    // must receive username to check
    if (!username) return res.status(400).send();

    const exists = await checkUsernameAvailable(username);
    res.status(200).json({ exists });
});

router.post('/data/leaderboard/', (req, res) => {
    const { offset } = req.body;

    getLeaderboard(offset)
        .then(response => res.status(200).json({ ...response, error: false }))
        .catch(() => res.status(400).send());
});

module.exports = router;
