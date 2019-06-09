const canvas = require('./components/canvas');
const modal = require('./components/modal');
const io = require('socket.io-client');

const findClickedPiece = require('./components/findClickedPiece');
const checkOptionsClicked = require('./components/checkOptionsClicked');

new Vue({
    el: '#app',
    components: { canvasComponent: canvas, modal },

    data: {
        players: [{ name: '', default: 'player 1', src: '#' }, { name: '', default: 'player 2', src: '#' }],

        gameEnded: false,
        winMessage: '',
        gameStarted: false,

        game: {
            pieces: [],
            options: {},
            currentPlayer: 0,
            selectedPiece: null,
        },

        socket: null,
        connecting: true,
        socketerror: null,

        foundGame: null,
        state: 'connecting',

        accepted: false,
        opponentAccepted: false,
        toggleSetup: false,
        // =============
        canvas: {
            width: 500,
            maxWidth: 500,
            gridSize: 500 / 8,
            halfGridSize: 500 / 16,
        },
        // =============

        update: null,
        preDraw: null,
        canvasElement: null,
    },

    mounted() {
        const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
        this.canvas.width = width;
        this.canvas.gridSize = width / 8;
        this.canvas.halfGridSize = width / 16;

        window.addEventListener('resize', this.handleResize);

        this.socket = io.connect('/');

        this.handleSocket();
    },

    methods: {
        beginSetup() {
            this.toggleSetup = true;
            this.joinQueue();
        },

        joinQueue() {
            this.socket.emit('game', { state: 'join_queue' }, () => {
                this.state = 'queue';
            });
        },

        cancelSetup() {
            this.socket.emit('game', { state: 'leave_queue' }, () => {
                this.state = null;
                this.toggleSetup = false;
            });
        },

        startGame() {
            this.gameStarted = true;

            setTimeout(() => {
                this.canvasElement.addEventListener('click', this.clickHandler);
                this.callCanvasRedraw();
            }, 0);
        },

        handleSocket() {
            this.socket.on('error', error => {
                this.socketerror = error;
            });

            this.socket.on('connect', () => {
                this.connecting = false;
                this.state = 'connected';
            });

            this.socket.on('disconnect', () => {
                this.connecting = true;
                this.state = 'connecting';
            });

            this.socket.on('game', data => {
                if (!data.hasOwnProperty('state')) return;

                if (data.state === 'opponent_left') {
                    alert('opponent left');

                    this.state = null;
                    this.gameStarted = false;
                    // this.accepted = false;
                    // hide modal
                    this.toggleSetup = false;

                    // alert('Opponent disconnected!');
                    return;
                }

                if (data.state === 'queue') {
                    this.state = data.state;
                    this.accepted = false;
                    this.opponentAccepted = false;
                    this.foundGame = null;
                    this.game = {};
                    this.players = [];
                    this.preDraw();
                    this.gameStarted = false;
                    this.gameEnded = false;

                    return;
                }

                if (data.state === 'found') {
                    this.foundGame = data;
                    this.state = data.state;
                    return;
                }

                if (data.state === 'accepted') {
                    this.opponentAccepted = true;
                    return;
                }

                if (data.state === 'ready') {
                    this.state = data.state;
                    this.game = {
                        ...data.game,
                        selectedPiece: null,
                    };

                    this.players = data.game.players.map(player => this.foundGame.data[player]);

                    this.startGame();

                    return;
                }

                if (data.state === 'new_turn') {
                    this.game = {
                        ...data.data.game,
                        selectedPiece: null,
                    };

                    this.callCanvasRedraw();
                }

                if (data.state === 'win') {
                    this.state = data.state;

                    console.log('game won', data.data);

                    // update game first
                    this.game = {
                        ...data.data.game,
                        selectedPiece: null,
                    };

                    this.callCanvasRedraw();

                    if (data.data.type === 'draw') {
                        this.winMessage = "It's a draw!";
                    } else {
                        this.winMessage = data.data.player === this.socket.id ? 'You Win!' : 'You Lose!';
                    }

                    this.gameEnded = true;
                }
            });
        },
        clickHandler({ offsetX, offsetY }) {
            if (this.gameEnded || this.game.currentPlayer !== this.socket.id) return;

            // if no piece is selected, cannot select an option..
            let selectedOption =
                this.game.selectedPiece === null
                    ? null
                    : checkOptionsClicked(this.game.options[this.game.selectedPiece], this.canvas.gridSize, offsetX, offsetY);

            if (selectedOption) {
                // Option is selected!
                //

                const move = {
                    selectedOption,
                    selectedPiece: this.game.selectedPiece,
                };

                // send data to server
                this.socket.emit('game', {
                    state: 'submit_turn',
                    data: {
                        move,
                    },
                });
            } else {
                // player didnt't click an option, now check if a piece is selected

                const foundPiece = findClickedPiece(
                    this.game.pieces,
                    this.game.currentPlayer,
                    this.canvas.gridSize,
                    this.canvas.halfGridSize,
                    offsetX,
                    offsetY
                );

                if (!!foundPiece && foundPiece.id === this.game.selectedPiece) {
                    this.game.selectedPiece = null;
                } else if (foundPiece) {
                    this.game.selectedPiece = foundPiece.id;
                } else {
                    this.game.selectedPiece = null;
                }

                this.callCanvasRedraw(this.game);
            }
        },

        acceptGame() {
            if (this.accepted) return;

            this.socket.emit(
                'game',
                {
                    state: 'accept',
                    data: {
                        gameIndex: this.foundGame.roomIndex,
                    },
                },
                () => {
                    this.accepted = true;
                }
            );
        },

        rejectGame() {
            // console.log('Game rejected');
        },

        fetchCanvasControls({ update, preDraw }, canvasElement) {
            this.update = update;
            this.preDraw = preDraw;
            this.canvasElement = canvasElement;

            this.preDraw();
        },

        callCanvasRedraw() {
            this.update({ ...this.game });
        },

        // generatePieces: generatePieces,
        handleResize() {
            // 20px for padding
            const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
            this.canvas.width = width;
            this.canvas.gridSize = width / 8;
            this.canvas.halfGridSize = width / 16;

            setTimeout(this.gameStarted ? this.callCanvasRedraw : this.preDraw, 0);
        },
    },
});
