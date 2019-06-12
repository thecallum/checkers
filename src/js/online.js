const io = require('socket.io-client');

const canvas = require('./components/canvas');
const modal = require('./components/modal');

const findClickedPiece = require('./components/findClickedPiece');
const checkOptionsClicked = require('./components/checkOptionsClicked');

new Vue({
    el: '#app',
    components: {
        canvasComponent: canvas,
        modal
    },
    data: {
        players: {},
        game: {},

        canvas: {
            width: 500,
            maxWidth: 500,
            gridSize: 500 / 8,
            halfGridSize: 500 / 16,
        },

        socket: null,
        connecting: true,
        socketerror: null,

        state: null,

        accepted: false,
        opponentAccepted: false,
        toggleSetup: false,
        opponentDisconnected: false,
        opponentLeft: false,
        gameEnded: false,
        winMessage: '',
        gameStarted: false,

        update: null,
        canvasElement: null,
    },

    mounted() {
        this.socket = io.connect('/');
        this.handleSocket();

        window.addEventListener('resize', this.handleResize);
    },

    methods: {
        updateCanvasSize() {
            const maxWidth = this.canvas.maxWidth;
            // 40px for padding
            const width = document.body.clientWidth - 40 > maxWidth ? maxWidth : document.body.clientWidth - 40;
            this.canvas.width = width;
            this.canvas.gridSize = width / 8;
            this.canvas.halfGridSize = width / 16;
        },

        handleResize() {
            this.updateCanvasSize();
            this.callCanvasRedraw(true);
        },

        beginSetup() {
            this.toggleSetup = true;
            this.joinQueue();
        },

        joinQueue() {
            this.socket.emit('game', {
                state: 'join_queue'
            }, () => {
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
            this.socket.emit('game', {
                state: 'leave_queue'
            }, () => {
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
        },

        updateGame(updates) {
            console.log('UPDATE GAME', updates)

            this.game = {
                ...updates,

                options: updates[this.socket.id].options,
                pieces: updates[this.socket.id].pieces,

                // pieces,
                selectedPiece: null
            };
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
            this.socket.emit('game', {
                state: 'accept'
            }, () => (this.accepted = true));
        },

        fetchCanvasControls(update, canvasElement) {
            this.update = update;
            this.canvasElement = canvasElement;

            setTimeout(() => {
                this.canvasElement.addEventListener('click', this.clickHandler);

                // only works when run twice, I don't know why
                this.handleResize();
                setTimeout(this.handleResize);
            }, 0);

            // this.callCanvasRedraw();
        },

        callCanvasRedraw(hasResized) {
            this.update(this.game, hasResized ? this.canvas : undefined);
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

                    // will recieve no options
                    // other player has the options

                    const updates = data.game;

                    console.log('NEW TURN', updates[this.socket.id])
                    this.updateGame({
                        ...updates,

                        options: updates[this.socket.id].options,
                        pieces: updates[this.socket.id].pieces,

                        // pieces,
                        selectedPiece: null
                    });
                    this.callCanvasRedraw();



                    // this.game = {
                    //     ...updates,

                    //     options: updates[this.socket.id].options,
                    //     pieces: updates[this.socket.id].pieces,

                    //     // pieces,
                    //     selectedPiece: null
                    // };
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
        clickHandler({
            offsetX,
            offsetY
        }) {
            if (this.gameEnded || this.game.currentPlayer !== this.socket.id) return;

            // if no piece is selected, cannot select an option..
            let selectedOption =
                this.game.selectedPiece === null ?
                null :
                checkOptionsClicked(this.game.options[this.game.selectedPiece], this.canvas.gridSize, offsetX, offsetY);

            if (selectedOption) {
                const move = {
                    selectedOption,
                    selectedPiece: this.game.selectedPiece
                };
                this.socket.emit('game', {
                    state: 'submit_turn',
                    move
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

                this.callCanvasRedraw();
            }
        },
    },

    computed: {
        currentPlayerMessage() {
            if (this.game.currentPlayer === this.socket.id) {
                return 'It\'s your turn';
            } else {
                return `It\'s ${this.players[this.game.currentPlayer].username}\'s turn`;
            }
        },
        opponent() {
            if (this.state !== 'found') return false;


            return this.players[Object.keys(this.players).filter(key => key !== this.socket.id)[0]].username;
        }
    }
});