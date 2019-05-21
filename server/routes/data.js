const express = require('express');
const router = express.Router();

const con = require('../db/connection');

const asyncQuery = require('../db/asyncQuery');

router.post('/data/usernames', async (req, res) => {
    const { username } = req.body;

    if (!username) return res.status(400).send();

    // validate recieved username 

    const query = `SELECT id FROM user WHERE username = '${ username }';`;
    const queryResult = await asyncQuery(con, query);
    const exists = !!queryResult[0];

    res.status(200).json({ exists })
})


module.exports = router;