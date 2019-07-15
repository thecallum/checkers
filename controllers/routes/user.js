const express = require('express');
const router = express.Router();
const { isEmail } = require('validator');

const updateUsername = require('../updateUsername');
const updateEmail = require('../updateEmail');
const updatePassword = require('../updatePassword');
const validatePassword = require('../validatePassword');
const validateUsername = require('../validateUsername');
const updateProfileImage = require('../updateProfileImage');
const deleteProfileImage = require('../deleteProfileImage');

const auth = require('../../middleware/auth');

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

router.post('/user/update/update-profile', auth, async (req, res) => {
    if (!req.files) return res.status(400).send('No files were uploaded.');
    const file = req.files.uploaded_image;
    const { id, profile_image: previousImage } = req.session.user;

    updateProfileImage(id, file.tempFilePath, previousImage)
        .then(({ url }) => {
            req.session.user = { ...req.session.user, profile_image: url };
            req.session.save();
            return res.status(200).json({ url });
        })
        .catch(err => {
            console.log('upload image err', err);
            res.status(400).send();
        });
});

router.post('/user/update/delete-profile', auth, async (req, res) => {
    const { id, profile_image: currentImage } = req.session.user;

    if (!currentImage) return res.status(400).send();

    deleteProfileImage(id, currentImage)
        .then(() => {
            req.session.user = { ...req.session.user, profile_image: undefined };
            req.session.save();
            res.status(200).send();
        })
        .catch(err => {
            console.log({ err });
            res.status(400).send();
        });
});

module.exports = router;
