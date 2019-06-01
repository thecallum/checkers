const express = require('express');
const router = express.Router();
const con = require('../db/connection');
const validator = require('validator');

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
        if (!validator.isEmail(email)) throw 'invalid email';

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
        // console.log('login error', e);
        res.status(401).send();
    }
})

router.post('/register', async (req, res) => {
    try {

        const { email, password, username, stayLogged } = req.body;

        if (!email || !password || !username) return res.status(400).send();

        // verify details
        // these should already have been validated clientside
        // therefore, if they are incorrect, they wil recieve a generic response

        // email
        if (!validator.isEmail(email)) throw 'Invalid email address';

        // password
        if (!password.match(/^.{10,128}$/)) throw 'Password invalid length';
        if (!!password.match(/(.)\1{2,}/)) throw 'Password more than 2 identical characters';

        // password matches min 3 of following rules
        let rulesMet = 0;

        if (password.match(/[A-Z]/)) rulesMet++;                   // 'At least 1 uppercase character (A-Z)'
        if (password.match(/[a-z]/)) rulesMet++;                   // 'At least 1 lowercase character (a-z)'
        if (password.match(/[0-9]/)) rulesMet++;                   // 'At least 1 digit (0-9)'
        if (password.match(/[!@#$%^&*(),.?":{}|<> ]/)) rulesMet++; // 'At least 1 special character (punctuation and space count as special characters)'

        if (rulesMet < 3) throw 'Password Min 3/4 rules met';

        // username
        if (!username.match(/^.{2,14}$/)) throw 'Username invalid length';
        if (!username.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/)) throw 'Username invalid characters';

        const hash = bcrypt.hashSync(password, saltRounds);

        const query = `INSERT INTO user (username, email, password) VALUES ('${username}','${email}','${hash}');`;

        const queryResponse = await asyncQuery(con, query);
    
        
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
        // console.log('Register error', e.message, !!e.message.includes('ER_DUP_ENTRY'))

        if (e.message.includes('ER_DUP_ENTRY') && e.message.includes('email')) {
            return res.status(400).json({
                message: 'Email taken'
            })
        }
        return res.status(400).send();
    }

})

module.exports = router;