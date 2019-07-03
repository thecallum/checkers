const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uuid = require('uuid/v1');
const { isEmail } = require('validator');

const updateUsername = require('../updateUsername');
const updateEmail = require('../updateEmail');
const updatePassword = require('../updatePassword');
const validatePassword = require('../validatePassword');
const validateUsername = require('../validateUsername');
const removeImage = require('../removeImage');

const auth = require('../../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../', '../', 'public', 'uploadedImages')),
    filename: (req, file, cb) => cb(null, uuid() + path.extname(file.originalname)),
});

const upload = multer({ storage }).single('uploaded_image');

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

router.post('/user/update/profile', auth, upload, async (req, res) => {
    const url = `/uploadedImages/${req.file.filename}`;
    const currentImage = req.session.user.profileImage;

    if (currentImage !== undefined) {
        const fileName = currentImage.split('/')[2];
        await removeImage(fileName);
    }

    req.session.user = { ...req.session.user, profileImage: url };
    req.session.save();
    res.status(200).json({ url });
});

module.exports = router;
