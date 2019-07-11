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
const updateProfileImage = require('../updateProfileImage');
const deleteProfileImage = require('../deleteProfileImage');

const auth = require('../../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../', '../', 'public', 'uploadedImages')),
    filename: (req, file, cb) => cb(null, uuid() + path.extname(file.originalname)),
});

const upload = multer({
    storage,
    size: 1000000,
    fileFilter: (req, file, cb) => {
        // check filetype
        const filetypes = /jpeg|jpg|png|gif|webp/;
        // check extension
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        // check mime
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            return cb('Error: images only');
        }
    },
}).single('uploaded_image');

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
    try {
        upload(req, res, err => {
            if (err) return res.status(400).json({ error: err });

            const fileName = req.file.filename;
            const { id, profile_image: currentImage } = req.session.user;

            updateProfileImage(id, fileName, currentImage)
                .then(({ url }) => {
                    req.session.user = { ...req.session.user, profile_image: `/uploadedImages/${url}` };
                    req.session.save();
                    res.status(200).json({ url: `/uploadedImages/${url}` });
                })
                .catch(() => res.status(500));
        });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/user/update/delete-profile', auth, async (req, res) => {
    const { id, profile_image: currentImage } = req.session.user;

    deleteProfileImage(id, currentImage)
        .then(() => {
            req.session.user = { ...req.session.user, profile_image: undefined };
            req.session.save();
            res.status(200).send();
        })
        .catch(() => res.status(500));
});

module.exports = router;
