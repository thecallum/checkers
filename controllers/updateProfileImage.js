const { updateProfileImage } = require('../models/user');
const removeTempFile = require('./removeTempFile');
const getImagePublicID = require('./getImagePublicID');
const cloudinary = require('cloudinary').v2;
const logger = require('../logger');

module.exports = (id, filePath, previousImage) =>
    new Promise(async (resolve, reject) => {
        const previousID = getImagePublicID(previousImage);

        try {
            cloudinary.uploader.upload(
                filePath,
                {
                    public_id: previousID ? previousID : undefined,
                    format: 'jpg',
                    allowed_formats: 'png, jpg, jpeg, gif, webp',
                    asnyc: true,
                },
                (err, result) => {
                    if (err) throw err;

                    const url = result.secure_url;

                    updateProfileImage(id, url)
                        .then(() => resolve({ url }))
                        .catch(err => {
                            throw err;
                        })
                        .finally(async () => await removeTempFile(filePath));
                }
            );
        } catch (err) {
            logger.error(err);
            reject(err);
        }
    });
