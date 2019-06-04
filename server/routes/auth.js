const express = require('express');
const router = express.Router();

const authenticateUser = require('../../controllers/authenticateUser');
const registerUser = require('../../controllers/registerUser');

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
});


// https://www.terlici.com/2014/08/25/best-practices-express-structure.html





router.post('/login', async (req, res) => {
    const { email, password, stayLogged } = req.body;

    if (!email || !password) return res.status(400).send();

    try {
        const user = await authenticateUser(email, password);
        if (!user) return res.status(401).send();

        const sessionUser = {
            email,
            username: user.username,
            id: user.id,
            stayLogged
        };

        req.session.save(() => {
            req.session.user = sessionUser;

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

        const newUser = await registerUser(username, email, password);
        
        // register successful 
        const sessionUser = {
            email,
            username,
            id: newUser.insertId,
            stayLogged
        };

        req.session.save(() => {
            req.session.user = sessionUser;

            // If user has selected stayLogged, cookie will expire in 1 week
            if (user.stayLogged) req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;

            res.status(200).send();
        })

    } catch(e) {
        if (!!e.message && e.message.includes('ER_DUP_ENTRY') && e.message.includes('email')) {
            return res.status(400).json({
                message: 'Email taken'
            })
        }
        return res.status(400).send();
    }

})

module.exports = router;