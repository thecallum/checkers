require('dotenv').config();
process.env.TESTING = true;

const io = require('socket.io-client');
const { app } = require('../../app');
const truncateUserTable = require('../testUtils/truncateUserTable');
const registerUser = require('../testUtils/registerUser');
const request = require('supertest');

let cookie1, cookie2, options1, options2;

const user1 = { email: 'email1@email.com', password: 'Password1234!', username: 'username111' };
const user2 = { email: 'email2@email.com', password: 'Password1234!', username: 'username222' };

beforeAll(async done => {
    await truncateUserTable();

    const response = await Promise.all([registerUser(app, user1), registerUser(app, user2)]);

    expect(response[0].status).toBe(200);
    expect(response[1].status).toBe(200);

    cookie1 = response[0].headers['set-cookie'];
    cookie2 = response[1].headers['set-cookie'];

    options1 = {
        transports: ['polling'],
        transportOptions: {
            polling: {
                extraHeaders: {
                    cookie: cookie1,
                },
            },
        },
    };

    options2 = {
        transports: ['polling'],
        transportOptions: {
            polling: {
                extraHeaders: {
                    cookie: cookie2,
                },
            },
        },
    };

    request(app)
        .get('/')
        .then(() => {
            done();
        });
});

describe('socket', () => {
    let socket1, socket2;

    beforeEach(done => {
        socket1 = io('ws://localhost:3000', options1);
        socket2 = io('ws://localhost:3000', options2);
        done();
    });

    afterEach(done => {
        socket1.disconnect();
        socket2.disconnect();
        done();
    });

    describe('join queue', () => {
        // jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        test('join queue', done => {
            socket1.on('error', err => done(err));
            socket1.emit('game', { state: 'join_queue' }, () => done());
        });

        test('get error when joining queue more than once/', done => {
            socket1.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {
                socket1.emit('game', { state: 'join_queue' }, err => {
                    expect(err).toBe(false);
                    done();
                });
            });
        });

        test('leave queue', done => {
            socket1.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {
                socket1.emit('game', { state: 'leave_queue' }, () => done());
            });
        });

        test('get error when trying to leave queue when not in queue', done => {
            socket1.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {
                socket1.emit('game', { state: 'leave_queue' }, err => {
                    expect(err).toBe(false);
                    done();
                });
            });
        });

        test('recieve found request when two players join queue', done => {
            socket1.on('error', err => done(err));
            socket2.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {});
            socket2.emit('game', { state: 'join_queue' }, () => {});

            socket1.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') {
                    expect(Object.keys(data.players).length).toBe(2);

                    Object.keys(data.players).forEach(key => {
                        const player = data.players[key];
                        expect([socket1.id, socket2.id]).toContain(key);
                        expect([user1.username, user2.username]).toContain(player.username);
                    });

                    done();
                }
            });
        });

        test('recieve player_left request', done => {
            socket1.on('error', err => done(err));
            socket2.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {});
            socket2.emit('game', { state: 'join_queue' }, () => {});

            socket1.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'opponent_left') done();
            });

            socket2.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') {
                    socket2.emit('game', { state: 'leave_queue' });
                }
            });
        });

        test('recieve game when both players accept', done => {
            socket1.on('error', err => done(err));
            socket2.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {});
            socket2.emit('game', { state: 'join_queue' }, () => {});

            socket1.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket1.emit('game', { state: 'accept' });
            });

            socket2.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket2.emit('game', { state: 'accept' });
                if (data.state === 'ready') done();
            });
        });

        test('recieve notification when opponent accepted game', done => {
            socket1.on('error', err => done(err));
            socket2.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {});
            socket2.emit('game', { state: 'join_queue' }, () => {});

            socket1.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket1.emit('game', { state: 'accept' });
            });

            socket2.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'accepted') done();
            });
        });
    });

    test('disconnect', done => {
        socket1.on('error', err => done(err));
        socket2.on('error', err => done(err));

        socket1.emit('game', { state: 'join_queue' }, () => {});
        socket2.emit('game', { state: 'join_queue' }, () => {});

        socket1.on('game', (data = JSON.parse(data)) => {
            if (data.state === 'opponent_left') done();
        });

        socket2.on('game', (data = JSON.parse(data)) => {
            if (data.state === 'found') socket2.disconnect();
        });
    });

    describe('submit turn', () => {
        test('recieve new turn after submitting one', done => {
            socket1.on('error', err => done(err));
            socket2.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {});
            socket2.emit('game', { state: 'join_queue' }, () => {});

            socket1.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket1.emit('game', { state: 'accept' });
            });

            socket2.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket2.emit('game', { state: 'accept' });
                if (data.state === 'new_turn') {
                    expect(!!data.game).toBe(true);
                    done();
                }
                if (data.state === 'ready') {
                    expect(!!data.game).toBe(true);

                    const selectedPiece = Object.keys(data.game.options).filter(key => data.game.options[key].length !== 0)[0];
                    const selectedOption = data.game.options[selectedPiece][0];

                    const move = { selectedOption, selectedPiece: Number(selectedPiece) };

                    if (data.game.currentPlayer === socket1.id) {
                        socket1.emit('game', { state: 'submit_turn', move });
                    } else {
                        socket2.emit('game', { state: 'submit_turn', move });
                    }
                }
            });
        });

        test('recieve error when submitting turn from incorrect user', done => {
            socket1.on('error', err => done(err));
            socket2.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {});
            socket2.emit('game', { state: 'join_queue' }, () => {});

            socket1.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket1.emit('game', { state: 'accept' });
            });

            socket2.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket2.emit('game', { state: 'accept' });
                if (data.state === 'ready') {
                    expect(!!data.game).toBe(true);

                    const selectedPiece = Object.keys(data.game.options).filter(key => data.game.options[key].length !== 0)[0];
                    const selectedOption = data.game.options[selectedPiece][0];

                    const move = { selectedOption, selectedPiece: Number(selectedPiece) };

                    if (data.game.currentPlayer === socket2.id) {
                        socket1.emit('game', { state: 'submit_turn', move }, err => {
                            expect(err).toBe(false);
                            done();
                        });
                    } else {
                        socket2.emit('game', { state: 'submit_turn', move }, err => {
                            expect(err).toBe(false);
                            done();
                        });
                    }
                }
            });
        });

        test('recieve error when submitting turn invalid turn format', done => {
            socket1.on('error', err => done(err));
            socket2.on('error', err => done(err));

            socket1.emit('game', { state: 'join_queue' }, () => {});
            socket2.emit('game', { state: 'join_queue' }, () => {});

            socket1.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket1.emit('game', { state: 'accept' });
            });

            socket2.on('game', (data = JSON.parse(data)) => {
                if (data.state === 'found') socket2.emit('game', { state: 'accept' });
                if (data.state === 'ready') {
                    expect(!!data.game).toBe(true);

                    const move = { selectedOption: {}, selectedPiece: 30 };

                    if (data.game.currentPlayer === socket2.id) {
                        socket1.emit('game', { state: 'submit_turn', move }, err => {
                            expect(err).toBe(false);
                            done();
                        });
                    } else {
                        socket2.emit('game', { state: 'submit_turn', move }, err => {
                            expect(err).toBe(false);
                            done();
                        });
                    }
                }
            });
        });
    });
});
