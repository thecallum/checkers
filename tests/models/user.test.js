require('dotenv').config();
process.env.TESTING = true;

const con = require('../../db/connection');
const truncateUserTable = require('../testUtils/truncateUserTable');
const asyncQuery = require('../../helpers/asyncQuery');

const { checkUsernameAvailable, register, login } = require('../../models/user');

describe('checkUsernameAvailable model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
    };

    beforeAll(async done => {
        await truncateUserTable();
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        await asyncQuery(con, query2);
        done();
    });

    test('existing username', async done => {
        const result = await checkUsernameAvailable(user.username);
        expect(result).toBe(false);
        done();
    });

    test('new username', async done => {
        const result = await checkUsernameAvailable(user.username + 'a');
        expect(result).toBe(true);
        done();
    });
});

describe('login model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
    };

    beforeAll(async done => {
        await truncateUserTable();
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        await asyncQuery(con, query2);
        done();
    });

    test('valid user', async done => {
        const result = await login(user.email);
        expect(result.username).toBe(user.username);
        expect(result.password).toBe(user.password);
        done();
    });

    test('non valid user', async done => {
        const result = await login(user.email + 'a');
        expect(result).toBe(null);
        done();
    });
});

describe('register model', () => {
    const user = {
        email: 'email@email.com',
        password: 'Password1234!',
        username: 'username1234',
    };

    const newUser = {
        email: 'email2@email.com',
        password: 'Password1234!',
        username: 'username12346',
    };

    beforeAll(async done => {
        await truncateUserTable();
        const query2 = `INSERT INTO user (email, password, username) VALUES ('${user.email}','${user.password}','${user.username}');`;
        await asyncQuery(con, query2);
        done();
    });

    test('existing user', async done => {
        register(user.username, user.email, user.password)
            .then(() => {
                throw 'Should throw error';
            })
            .catch(err => {
                expect(err).not.toBe('Should throw error');
                done();
            });
    });

    test('valid user', async done => {
        const result = await register(newUser.username, newUser.email, newUser.password);
        expect(!!result).toBe(true);
        done();
    });
});
