const bcrypt = require('bcrypt');
const saltRounds = 15;

require('dotenv').config();

process.env.TESTING = true;

const { app, server } = require('../../../app');

const request = require('supertest');
const path = require('path');
const fs = require('fs');

const con = require('../../../db/connection');

const truncateUserTable = require('../../testUtils/truncateUserTable');
const registerUser = require('../../testUtils/registerUser');

const user1 = { email: 'email1@email.com', password: 'Password1234!', hash: bcrypt.hashSync('Password1234!', saltRounds), username: 'username111', id: null };
const user2 = { email: 'email2@email.com', password: 'Password1234!', hash: bcrypt.hashSync('Password1234!', saltRounds), username: 'username222', id: null };

afterAll(done => {
    server.close(() => {
        done();
    });
});

describe('POST /user/update/username', () => {
    const newUsername = 'user1234';
    let cookie1;
    beforeEach(async done => {
        await truncateUserTable();
        const response = await Promise.all([registerUser(app, user1), registerUser(app, user2)]);

        expect(response[0].status).toBe(200);
        expect(response[1].status).toBe(200);

        cookie1 = response[0].headers['set-cookie'];

        done();
    });

    test('update username that is already taken', done => {
        request(app)
            .post('/user/update/username')
            .set('Cookie', cookie1)
            .send({ username: user2.username })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('update username with invalid username', done => {
        request(app)
            .post('/user/update/username')
            .set('Cookie', cookie1)
            .send({ username: 't'.repeat(30) })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('update username', done => {
        request(app)
            .post('/user/update/username')
            .set('Cookie', cookie1)
            .send({ username: newUsername })
            .then(response => {
                expect(response.status).toBe(200);

                const query = `select username from user where email = '${user1.email}';`;

                con.query(query, (err, response) => {
                    if (err) done(err);
                    expect(response[0].username).toBe(newUsername);
                    done();
                });
            })
            .catch(e => done(e));
    });
});

describe('POST /user/update/email', () => {
    const newEmail = 'newEmail@email.com';
    let cookie1;

    beforeEach(async done => {
        await truncateUserTable();
        const response = await Promise.all([registerUser(app, user1), registerUser(app, user2)]);

        expect(response[0].status).toBe(200);
        expect(response[1].status).toBe(200);

        cookie1 = response[0].headers['set-cookie'];

        done();
    });

    test('update email that is already taken', done => {
        request(app)
            .post('/user/update/email')
            .set('Cookie', cookie1)
            .send({ email: user2.email })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('update username with invalid email', done => {
        request(app)
            .post('/user/update/email')
            .set('Cookie', cookie1)
            .send({ email: 'asdhasdhuasd' })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('update email', done => {
        request(app)
            .post('/user/update/email')
            .set('Cookie', cookie1)
            .send({ email: newEmail })
            .then(response => {
                expect(response.status).toBe(200);

                const query = `select email from user where username = '${user1.username}';`;

                con.query(query, (err, response) => {
                    if (err) done(err);
                    expect(response[0].email).toBe(newEmail);
                    done();
                });
            })
            .catch(e => done(e));
    });
});

describe('POST /user/update/password', () => {
    const newPassword = 'NewPassWord1234!';
    let cookie1;

    beforeEach(async done => {
        await truncateUserTable();
        const response = await Promise.all([registerUser(app, user1), registerUser(app, user2)]);

        expect(response[0].status).toBe(200);
        expect(response[1].status).toBe(200);

        cookie1 = response[0].headers['set-cookie'];

        done();
    });

    test('update password with invalid password', done => {
        request(app)
            .post('/user/update/password')
            .set('Cookie', cookie1)
            .send({ newPassword: 'password' })
            .then(response => {
                expect(response.status).toBe(400);
                done();
            })
            .catch(e => done(e));
    });

    test('update password', done => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

        request(app)
            .post('/user/update/password')
            .set('Cookie', cookie1)
            .send({ newPassword, currentPassword: user1.password })
            .then(res => {
                expect(res.status).toBe(200);

                const query = `select password from user where email = '${user1.email}';`;

                con.query(query, (err, response) => {
                    if (err) done(err);
                    const storedPassword = response[0].password;

                    bcrypt.compare(newPassword, storedPassword, (err, res) => {
                        if (err) done(err);
                        expect(res).toBe(true);
                        done();
                    });
                });
            })
            .catch(e => done(e));
    });
});

describe('POST /user/update/update-profile', () => {
    const testImage = path.resolve(__dirname, '..', '..', 'testUtils', 'testImage.jpg');
    const testFile = path.resolve(__dirname, '..', '..', 'testUtils', 'testFile.pdf');
    let cookie1;

    beforeEach(async done => {
        await truncateUserTable();
        const response = await registerUser(app, user1);

        expect(response.status).toBe(200);

        cookie1 = response.headers['set-cookie'];

        done();
    });

    test('update profile image', done => {
        request(app)
            .post('/user/update/update-profile')
            .set('Cookie', cookie1)
            .set('content-type', 'application/octet-stream')
            .attach('uploaded_image', testImage)
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.url).not.toBe('');

                const url = response.body.url;
                const query = `SELECT profile_image FROM user WHERE email = '${user1.email}';`;

                con.query(query, (err, response) => {
                    if (err) done(err);

                    expect(response[0].profile_image).toBe(url);

                    fs.stat(path.join(__dirname, '..', '..', '..', 'public', url), (err, stats) => {
                        if (err) done(err);
                        done();
                    });
                });
            });
    });

    test('no image sent', done => {
        request(app)
            .post('/user/update/update-profile')
            .set('Cookie', cookie1)
            .set('content-type', 'application/octet-stream')
            .then(response => {
                expect(response.status).toBe(400);
                done();
            });
    });

    test('Invalid file type', done => {
        request(app)
            .post('/user/update/update-profile')
            .set('Cookie', cookie1)
            .set('content-type', 'application/octet-stream')
            .attach('uploaded_image', testFile)
            .then(response => {
                expect(response.status).toBe(400);
                done();
            });
    });
});

describe('POST /user/update/delete-profile', () => {
    const testImage = path.resolve(__dirname, '..', '..', 'testUtils', 'testImage.jpg');
    let cookie1;
    let url;

    beforeEach(async done => {
        await truncateUserTable();
        const response = await registerUser(app, user1);

        expect(response.status).toBe(200);

        cookie1 = response.headers['set-cookie'];

        request(app)
            .post('/user/update/update-profile')
            .set('Cookie', cookie1)
            .set('content-type', 'application/octet-stream')
            .attach('uploaded_image', testImage)
            .then(response => {
                expect(response.status).toBe(200);
                expect(response.body.url).not.toBe('');

                url = response.body.url;
                done();
            });
    });

    test('remove profile image', done => {
        request(app)
            .post('/user/update/delete-profile')
            .set('Cookie', cookie1)
            .then(response => {
                expect(response.status).toBe(200);

                const query = `SELECT profile_image FROM user WHERE email = '${user1.email}';`;

                con.query(query, (err, response) => {
                    if (err) done(err);

                    expect(response[0].profile_image).toBe(null);

                    fs.stat(path.join(__dirname, '..', '..', '..', 'public', url), (err, stats) => {
                        if (err) {
                            done();
                        } else {
                            done(new Error('File shouldnt exist'));
                        }
                    });
                });
            });
    });
});
