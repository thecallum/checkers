const request = require('supertest');

const registerUser = (app, body) =>
    new Promise(resolve => {
        request(app)
            .post('/register')
            .send(body)
            .then(response => {
                resolve(response);
            });
    });

module.exports = registerUser;
