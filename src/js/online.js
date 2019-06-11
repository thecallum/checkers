const io = require('socket.io-client');

const canvas = require('./components/canvas');
const modal = require('./components/modal');

const findClickedPiece = require('./components/findClickedPiece');
const checkOptionsClicked = require('./components/checkOptionsClicked');
const setCanvasWidth = require('./components/setCanvasWidth');

new Vue({
    el: '#app',
    components: { canvasComponent: canvas, modal },
    data: {
        players: {},
        game: {},

        socket: null,
        connecting: true,
        socketerror: null,

        state: 'connecting',

        accepted: false,
        opponentAccepted: false,
        toggleSetup: false,
        opponentDisconnected: false,
        opponentLeft: false,
        gameEnded: false,
        winMessage: '',
        gameStarted: false,

        canvas: {
            width: 500,
            maxWidth: 500,
            gridSize: 500 / 8,
            halfGridSize: 500 / 16,
        },

        update: null,
        preDraw: null,
        canvasElement: null,
    },

    mounted() {
        this.setCanvasWidth();
        window.addEventListener('resize', this.handleResize);
        this.socket = io.connect('/');
        this.handleSocket();
    },

    methods: {
        setCanvasWidth,

        beginSetup() {
            this.toggleSetup = true;
            this.joinQueue();
        },

        joinQueue() {
            this.socket.emit('game', { state: 'join_queue' }, () => {
                this.state = 'queue';
            });
        },

        rejoinQueue() {
            this.state = null;
            this.accepted = false;
            this.gameStarted = false;
            this.opponentAccepted = false;
            this.game = {};
            this.opponentDisconnected = false;

            this.joinQueue();
        },

        cancelSetup() {
            this.socket.emit('game', { state: 'leave_queue' }, () => {
                this.state = null;
                this.toggleSetup = false;

                // reset values
                this.accepted = false;
                this.opponentAccepted = false;
            });
        },

        rematch() {
            alert('Feature not build yet');
        },

        startGame() {
            this.gameStarted = true;

            setTimeout(() => {
                this.canvasElement.addEventListener('click', this.clickHandler);
                this.callCanvasRedraw();
                setTimeout(this.callCanvasRedraw);
            });
        },

        updateGame(updates) {
            this.game = { ...updates, selectedPiece: null };
        },

        updateWinMessage(winType, player) {
            if (winType === 'draw') {
                this.winMessage = "It's a draw!";
            } else {
                this.winMessage = player === this.socket.id ? 'You Win!' : 'You Lose!';
            }
        },

        acceptGame() {
            if (this.accepted) return;
            this.socket.emit('game', { state: 'accept' }, () => (this.accepted = true));
        },

        fetchCanvasControls({ update, preDraw }, canvasElement) {
            this.update = update;
            this.preDraw = preDraw;
            this.canvasElement = canvasElement;

            this.preDraw();
        },

        callCanvasRedraw() {
            this.update({
                ...this.game,
                width: this.canvas.width,
                gridSize: this.canvas.gridSize,
                halfGridSize: this.canvas.halfGridSize,
            });
        },

        handleResize() {
            this.setCanvasWidth();
            setTimeout(() => {
                this.gameStarted ? this.callCanvasRedraw() : this.preDraw();

                setTimeout(() => {
                    this.gameStarted ? this.callCanvasRedraw() : this.preDraw();
                });
            });
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
                    this.accepted = false;
                    this.opponentAccepted = false;
                    this.opponentLeft = true;

                    return this.joinQueue();
                }

                if (data.state === 'found') {
                    this.state = 'found';
                    this.players = data.players;
                    return;
                }

                if (data.state === 'accepted') {
                    this.opponentAccepted = true;
                    return;
                }

                if (data.state === 'ready') {
                    this.state = 'ready';
                    this.updateGame(data.game);
                    this.startGame();
                    return;
                }

                if (data.state === 'new_turn') {
                    this.updateGame(data.game);
                    this.callCanvasRedraw();
                    return;
                }

                if (data.state === 'win') {
                    this.state = 'win';

                    this.updateGame(data.game);
                    this.callCanvasRedraw();
                    this.updateWinMessage(data.winMessage, data.player);

                    this.gameEnded = true;
                    return;
                }

                if (data.state === 'disconnect') {
                    this.opponentDisconnected = true;
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
                const move = { selectedOption, selectedPiece: this.game.selectedPiece };
                this.socket.emit('game', { state: 'submit_turn', move });
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

                this.callCanvasRedraw();
            }
        },
    },
});
