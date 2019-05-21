const express = require('express');
const router = express.Router();
const con = require('../db/connection');

const asyncQuery = require('../db/asyncQuery');

const bcrypt = require('bcrypt');
const saltRounds = 15;

const generateCookieOptions = require('../cookieOptions');

router.get('/logout', (req, res) => {
    res.cookie('sessionId', null);
    res.redirect('/');
});

router.post('/login', async (req, res) => {
    const { email, password, stayLogged } = req.body;

    if (!email || !password) return res.status(400).send();

    const query = `SELECT id, username, password FROM user WHERE email = '${email}';`;

    const queryResponse = await asyncQuery(con, query);
    if (!queryResponse.success) return res.status(401).send();
    if (queryResponse.response.length === 0) return res.status(401).send();

    const { password: res_password, id: res_id, username: res_username } = queryResponse.response[0];

    const validPassword = bcrypt.compareSync(password, res_password);
    if (!validPassword) return res.status(401).send();

    // login successful 

    const user = {
        email,
        username: res_username,
        id: res_id,
        stayLogged
    };

    const payload = JSON.stringify(user);

    res.cookie('sessionId', payload, generateCookieOptions(stayLogged || false));

    res.status(200).send();
})

router.post('/register', async (req, res) => {
    const { email, password, username, stayLogged } = req.body;

    if (!email || !password || !username) return res.status(400).send();

    const hash = bcrypt.hashSync(password, saltRounds);

    const query = `INSERT INTO user (username, email, password) VALUES ('${username}','${email}','${hash}');`;

    const queryResponse = await asyncQuery(con, query);
    if (!queryResponse.success) return res.status(500).send();

    // register successful 
    const user = {
        email,
        username,
        id: queryResponse.response.insertId,
        stayLogged
    };

    const payload = JSON.stringify(user);

    res.cookie('sessionId', payload, generateCookieOptions(stayLogged || false));
    res.status(200).send();
})

module.exports = router;