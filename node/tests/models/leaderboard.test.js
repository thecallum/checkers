require('dotenv').config();
process.env.TESTING = true;
const expect = require('expect');

const con = require('../../db/connection');
const resetUserTable = require('../testUtils/resetUserTable');
const resetLeaderboardTable = require('../testUtils/resetLeaderboardTable');
const asyncQuery = require('../../helpers/asyncQuery');

const { get, update } = require('../../models/leaderboard');

describe('get leaderboard model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
    };

    beforeEach(async done => {
        await resetLeaderboardTable();
        await resetUserTable();
        const query1 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        const result = await asyncQuery(con, query1);

        user.id = result.insertId;

        const query2 = `INSERT INTO leaderboard (id, win) VALUES (${user.id}, 1);`;
        await asyncQuery(con, query2);
        done();
    });

    test('get leaderboard', done => {
        get(0)
            .then(({ data, total, next, back }) => {
                expect(total).toBe(1);
                expect(next).toBe(false);
                expect(back).toBe(false);
                expect(data.length).toBe(1);
                done();
            })
            .catch(e => done(e));
    });
});

describe('update leaderboard model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
        id: null,
    };

    beforeEach(async done => {
        await resetLeaderboardTable();
        await resetUserTable();
        const query1 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        const result = await asyncQuery(con, query1);

        user.id = result.insertId;

        // const query2 = `INSERT INTO leaderboard (id, win) VALUES (${user.id}, 1);`;
        // await asyncQuery(con, query2);
        done();
    });

    test('insert value into leaderboard', done => {
        update('win', user.id)
            .then(() => {
                const query = `SELECT * FROM leaderboard WHERE id = ${user.id};`;

                con.query(query, (err, result) => {
                    if (err) done(err);

                    expect(result.length).toBe(1);

                    expect(result[0].win).toBe(1);
                    expect(result[0].lose).toBe(0);
                    expect(result[0].draw).toBe(0);

                    done();
                });
            })
            .catch(e => done(e));
    });

    test('insert value twice into leaderboard', done => {
        update('win', user.id)
            .then(() => {
                update('win', user.id).then(() => {
                    const query = `SELECT * FROM leaderboard WHERE id = ${user.id};`;

                    con.query(query, (err, result) => {
                        if (err) done(err);

                        expect(result.length).toBe(1);
                        expect(result[0].win).toBe(2);
                        expect(result[0].lose).toBe(0);
                        expect(result[0].draw).toBe(0);

                        done();
                    });
                });
            })
            .catch(e => done(e));
    });

    test('insert value with invalid userID', done => {
        update('win', 'a')
            .then(res => {
                expect(res).toBe(false);
                done();
            })
            .catch(e => done(e));
    });
});
