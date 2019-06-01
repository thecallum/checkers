const express = require('express');
const router = express.Router();
const con = require('../db/connection');

const asyncQuery = require('../db/asyncQuery');

const bcrypt = require('bcrypt');
const saltRounds = 15;

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
});

router.post('/login', async (req, res) => {
    const { email, password, stayLogged } = req.body;

    if (!email || !password) return res.status(400).send();

    try {
        const query = `SELECT id, username, password FROM user WHERE email = '${email}';`;

        const queryResponse = await asyncQuery(con, query);

        if (queryResponse.length === 0) {
            // invalid email
            // going to decrypt a random password to simulate the time
            // otherwise, you can tell if an email address exists by the resposonse time

            const generic = '$2b$15$pKhBptaA7pMZeABdXYLSmOIRioJRINEB9wuwwwxJadNkptAo64Fwa';

            await bcrypt.compare(password, generic);

            return res.status(401).send();
        }

        const { password: res_password, id: res_id, username: res_username } = queryResponse[0];

        const validPassword = await bcrypt.compare(password, res_password);
        if (!validPassword) return res.status(401).send();

        // login successful 

        const user = {
            email,
            username: res_username,
            id: res_id,
            stayLogged
        };

        req.session.save(() => {
            req.session.user = user;

            // If user has selected stayLogged, cookie will expire in 1 week
            if (user.stayLogged) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
            res.status(200).send();
        })


    } catch(e) {
        console.log('login error', e);
        res.status(401).send();
    }
})

router.post('/register', async (req, res) => {
    const { email, password, username, stayLogged } = req.body;

    if (!email || !password || !username) return res.status(400).send();

    const hash = bcrypt.hashSync(password, saltRounds);

    const query = `INSERT INTO user (username, email, password) VALUES ('${username}','${email}','${hash}');`;

    const queryResponse = await asyncQuery(con, query);

    try {
        // register successful 
        const user = {
            email,
            username,
            id: queryResponse.insertId,
            stayLogged
        };

        req.session.save(() => {
            req.session.user = user;

            // If user has selected stayLogged, cookie will expire in 1 week
            if (user.stayLogged) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;

            res.status(200).send();
        })

    } catch(e) {
        console.log('Register error', e)
        return res.status(500).send();
    }

})

module.exports = router;