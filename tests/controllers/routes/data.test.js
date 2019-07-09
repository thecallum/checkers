require('dotenv').config();

process.env.TESTING = true;

const { app, server } = require('../../../app');

const request = require('supertest');

const con = require('../../../db/connection');

const truncateUserTable = require('../../testUtils/truncateUserTable');
const truncateLeaderboardTable = require('../../testUtils/truncateLeaderboardTable');

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
        await truncateLeaderboardTable();
        await truncateUserTable();

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
