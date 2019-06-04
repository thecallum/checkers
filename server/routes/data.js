const express = require('express');
const router = express.Router();

const checkUsernameAvailable = require('../../controllers/checkUsernameAvailable');

router.post('/data/usernames', async (req, res) => {
    const { username } = req.body;

    // must receive username to check
    if (!username) return res.status(400).send();

    const exists = await checkUsernameAvailable(username);
    res.status(200).json({ exists });
});

module.exports = router;