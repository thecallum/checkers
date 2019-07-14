const { updateProfileImage: updateImage } = require('../models/user');
const removeTempFile = require('./removeTempFile');

const cloudinary = require('cloudinary').v2;

const updateProfileImage = (id, filePath) =>
    new Promise(async (resolve, reject) => {
        try {
            cloudinary.uploader.upload(filePath, (err, result) => {
                if (err) reject(err);

                const url = result.secure_url;

                updateImage(id, url)
                    .then(() => resolve({ url }))
                    .catch(err => reject(err))
                    .finally(async () => await removeTempFile(filePath));
            });
        } catch (err) {
            reject(err);
        }
    });

module.exports = updateProfileImage;
