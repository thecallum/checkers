const cloudinary = require('cloudinary').v2;

module.exports = () => {
    if (!process.env.cloud_name) throw 'Missing env variable cloud_name';
    if (!process.env.api_key) throw 'Missing env variable api_key';
    if (!process.env.api_secret) throw 'Missing env variable api_secret';

    cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
    });
};
