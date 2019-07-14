const { updateProfileImage: updateImage } = require('../models/user');
const removeTempFile = require('./removeTempFile');

const cloudinary = require('cloudinary').v2;

const updateProfileImage = (id, filePath, previousImage) =>
    new Promise(async (resolve, reject) => {
        const previousID =
            previousImage === undefined
                ? false
                : previousImage
                      .split('/')
                      .slice(-1)[0]
                      .split('.')[0];

        try {
            cloudinary.uploader.upload(filePath, previousID ? { public_id: previousID } : {}, (err, result) => {
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
