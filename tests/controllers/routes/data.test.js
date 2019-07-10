require('dotenv').config();

process.env.TESTING = true;

const { app, server } = require('../../../app');

const request = require('supertest');

const con = require('../../../db/connection');

const resetUserTable = require('../../testUtils/resetUserTable');
const resetLeaderboardTable = require('../../testUtils/resetLeaderboardTable');

const user = {
    email: 'email1@email.com',
    password: 'Password1234!',
    username: 'username111',
    id: null,
};

afterAll(done => {
    server.close(() => {
        done();
    });
});

describe('POST /data/leaderboard', () => {
    beforeEach(async done => {
        await resetLeaderboardTable();
        await resetUserTable();

        const query1 = `INSERT INTO user (email, password, username) VALUES ('${user.email}', '${user.password}', '${user.username}');`;

        con.query(query1, (err, response) => {
            if (err) done(err);

            user.id = response.insertId;

            const query2 = `INSERT INTO leaderboard (id, win) VALUES (${user.id}, 1);`;

            con.query(query2, (err, response) => {
                if (err) done(err);

                done();
            });
        });
    });

    test('get leaderboard', done => {
        request(app)
            .post('/data/leaderboard')
            .send({ offset: 0 })
            .then(response => {
                expect(response.status).toBe(200);

                const { data, total, next, back, error } = response.body;

                expect(total).toBe(1);
                expect(next).toBe(false);
                expect(back).toBe(false);
                expect(error).toBe(false);
                expect(data.length).toBe(1);

                done();
            })

            .catch(e => done(e));
    });
});

describe('POST /data/usernames', () => {
    beforeEach(async done => {
        await resetUserTable();

        const query1 = `INSERT INTO user (email, password, username) VALUES ('${user.email}', '${user.password}', '${user.username}');`;

        con.query(query1, (err, response) => {
            if (err) done(err);

            done();
        });
    });

    test('should return false', done => {
        request(app)
            .post('/data/usernames')
            .send({ username: user.username })
            .then(response => {
                expect(response.status).toBe(200);

                expect(response.body.exists).toBe(false);
                done();
            })

            .catch(e => done(e));
    });

    test('should return true', done => {
        request(app)
            .post('/data/usernames')
            .send({ username: 'availableUsername' })
            .then(response => {
                expect(response.status).toBe(200);

                expect(response.body.exists).toBe(true);
                done();
            })

            .catch(e => done(e));
    });
});
