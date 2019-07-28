// const request = require('supertest');
const bcrypt = require('bcrypt');
const saltRounds = 15;

require('dotenv').config();

process.env.TESTING = true;

const { app, server } = require('../../../app');

const con = require('../../../db/connection');

const resetUserTable = require('../../testUtils/resetUserTable');

var request = require('supertest');

afterAll(done => {
    server.close(() => {
        done();
    });
});

describe('POST /login', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        hash: bcrypt.hashSync('Password1234!', saltRounds),
        username: 'username1234',
    };

    beforeEach(async done => {
        await resetUserTable();
        const query = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.hash}','${user.username}');`;

        con.query(query, (err, result) => {
            if (err) done(err);
            done();
        });
    });

    test('Valid user', done => {
        request(app)
            .post('/login')
            .send({
                email: user.email,
                password: user.password,
            })
            .then(response => {
                expect(response.status).toBe(200);
                done();
            })
            .catch(e => done(e));
    });

    test('Missing email', done => {
        request(app)
            .post('/login')
            .send({
                password: user.password,
            })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('Missing password', done => {
        request(app)
            .post('/login')
            .send({
                email: user.email,
            })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('Invalid email', done => {
        request(app)
            .post('/login')
            .send({
                email: user.email + 'a',
                password: user.password,
            })
            .then(response => {
                expect(response.status).toBe(401);
                done();
            })
            .catch(e => done(e));
    });

    test('Valid password', done => {
        request(app)
            .post('/login')
            .send({
                email: user.email,
                password: user.password + 'a',
            })
            .then(response => {
                expect(response.status).toBe(401);
                done();
            })
            .catch(e => done(e));
    });
});

describe('POST /register', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        hash: bcrypt.hashSync('Password1234!', saltRounds),
        username: 'username1234',
    };

    const existing = {
        email: 'email2@email.com',
        password: 'Password1234!',
        hash: bcrypt.hashSync('Password1234!', saltRounds),
        username: 'username12345',
    };

    beforeEach(async done => {
        await resetUserTable();
        const query = `INSERT INTO user (email, password, username) VALUES ('${existing.email}','${existing.hash}','${existing.username}');`;

        con.query(query, (err, result) => {
            if (err) done(err);
            done();
        });
    });

    describe('Password Rules', () => {
        test('Too short', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: '1aA!',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Too long', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: '1aA!'.repeat(40),
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('3 identical characters', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: '1aaaaaaaA!',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Minimum rules -- capital and lower', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: 'AbhuJGVija',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Minimum rules -- capital and number', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: '3BHU653IJA',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Minimum rules -- capital and special', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: 'A*)~JGV)J .,',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Minimum rules -- lower and number', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: '9bhu345ija',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Minimum rules -- lower and special', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: '#bhu@).ija',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Minimum rules -- number and special', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: '9465(.)8@#~',
                    username: user.username,
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });
    });

    test('Invalid email', done => {
        request(app)
            .post('/register')
            .send({
                email: 'asdasdasdasdas',
                password: user.password,
                username: user.username,
            })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    describe('Username rules', () => {
        test('Too short', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: user.password,
                    username: 'a',
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });

        test('Too long', done => {
            request(app)
                .post('/register')
                .send({
                    email: user.email,
                    password: user.password,
                    username: 'a'.repeat(20),
                })
                .then(response => {
                    expect(response.status).toBe(400);
                    done();
                })
                .catch(e => done(e));
        });
    });

    test('Existing username', done => {
        request(app)
            .post('/register')
            .send({
                email: user.email,
                password: user.password,
                username: existing.username,
            })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('Existing email', done => {
        request(app)
            .post('/register')
            .send({
                email: existing.email,
                password: user.password,
                username: user.username,
            })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('Valid user', done => {
        request(app)
            .post('/register')
            .send({
                email: user.email,
                password: user.password,
                username: user.username,
            })
            .then(response => {
                expect(response.status).toBe(200);
                const query = `SELECT * FROM user WHERE email = '${user.email}';`;

                con.query(query, (err, result) => {
                    if (err) done(err);

                    expect(result.length).toBe(1);

                    expect(result[0].email).toBe(user.email);
                    expect(bcrypt.compareSync(user.password, result[0].password)).toBe(true);
                    expect(result[0].username).toBe(user.username);

                    done();
                });
            })
            .catch(e => done(e));
    });
});
