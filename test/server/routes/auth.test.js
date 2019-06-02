// const expect = require('expect');
const request = require('supertest');

require('dotenv').config();


const expressServer = require('../../../server/expressServer');

let app;

beforeAll(done => {
    expressServer().then(server => {
        app = server;
        app.listen('4000');
        done();
    })
});


describe('test block', () => {
    
    test('some test', done => {

        // expect(true).toBe(true);
        // done();


                    request(app)
            .post('/login')
            .send({
                email: 'callummac@protonmail.com',
                password: 'password124'
            })
            .then(response => {
                console.log('status', response.status);
                
                expect(response.status).toBe(400);
    
                done();
            })
            .catch(e => done(e));


    })
})

