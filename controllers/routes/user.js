const express = require('express');
const router = express.Router();

const updateUsername = require('../updateUsername');
const updateEmail = require('../updateEmail');
const updatePassword = require('../updatePassword');

const validatePassword = require('../validatePassword');
const validateUsername = require('../validateUsername');
const multer = require('multer');
const { isEmail } = require('validator');
const path = require('path');
const auth = require('../../middleware/auth');

const uuid = require('uuid/v1');
// uuid(); // ⇨ '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e'

router.post('/user/update/username', auth, (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).send();

    const { id } = req.session.user;

    if (!validateUsername(username)) return res.status(400).send();

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

    if (!email || !isEmail(email)) return res.status(400).send();
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

router.post('/user/update/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // validate new password

    if (!currentPassword || !newPassword || !validatePassword(newPassword)) return res.status(400).send();
    const { id } = req.session.user;

    updatePassword(currentPassword, newPassword, id)
        .then(response => res.status(response ? 200 : 401).send())
        .catch(() => res.status(400).send());
});

const fileLocation = path.resolve(__dirname, '../', '../', 'public', 'uploadedImages');

console.log({ fileLocation });

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, fileLocation);
    },
    filename: function(req, file, cb) {
        const newName = uuid() + path.extname(file.originalname);
        cb(null, newName);
    },
});

var upload = multer({
    storage,
}).single('uploaded_image');

router.post('/user/update/profile', auth, upload, async (req, res) => {
    console.log('UPLOAD IMAGE REQUEST');

    console.log('file', req.file);

    res.status(200).json({
        url: `/uploadedImages/${req.file.filename}`,
    });

    // res.status(200).send();
});

module.exports = router;
