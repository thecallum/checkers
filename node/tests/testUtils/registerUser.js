const request = require('supertest');

module.exports = (app, body) =>
    new Promise(resolve => {
        request(app)
            .post('/register')
            .send(body)
            .then(response => {
                resolve(response);
            });
    });
