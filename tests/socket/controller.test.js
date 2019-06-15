require('dotenv').config();

process.env.TESTING = true;

const request = require('supertest');
const truncateUserTable = require('../testUtils/truncateUserTable');

const io = require('socket.io-client');

const app = require('../../app');

let cookie;
let options;

beforeAll(async done => {
    const user = {
        email: 'email3@email.com',
        password: 'Password1234!',
        username: 'username1234',
    };

    await truncateUserTable();

    request(app)
        .post('/register')
        .send({
            email: user.email,
            password: user.password,
            username: user.username,
        })
        .then(response => {
            expect(response.status).toBe(200);

            cookie = response.headers['set-cookie'];

            options = {
                transports: ['polling'],
                transportOptions: {
                    polling: {
                        extraHeaders: {
                            cookie: cookie[0],
                        },
                    },
                },
            };

            done();
        });
});

describe('describe', () => {
    let socket;

    beforeEach(() => {
        socket = io('ws://localhost:3000', options);
    });

    test('test', done => {
        socket.on('error', err => done(err));

        socket.emit('game', { state: 'join_queue' }, () => {
            done();
        });
    });

    test('test', done => {
        socket.on('error', err => done(err));

        socket.emit('game', { state: 'join_queue' }, () => {
            done();
        });
    });
});
