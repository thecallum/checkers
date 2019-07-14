const canvas = require('../components/canvas');
const modal = require('../components/modal');

const generatePieces = require('../game_modules/generatePieces');
const generateOptions = require('../game_modules/generateOptions');
const findClickedPiece = require('../game_modules/findClickedPiece');
const updatePieces = require('../game_modules/updatePieces');
const nextPlayer = require('../game_modules/nextPlayer');
const checkOptionsClicked = require('../game_modules/checkOptionsClicked');
const colors = require('../game_modules/colors');

new Vue({
    el: '#app',
    components: {
        canvasComponent: canvas,
        modal,
    },
    data: {
        players: [
            {
                name: '',
                default: 'player 1',
                src: 'http://orig11.deviantart.net/8fb6/f/2014/142/a/0/best_shrek_face_by_mrlorgin-d7jaspk.jpg',
                color: 0,
            },
            {
                name: '',
                default: 'player 2',
                src: 'http://orig11.deviantart.net/8fb6/f/2014/142/a/0/best_shrek_face_by_mrlorgin-d7jaspk.jpg',
                color: 1,
            },
        ],

        colors: colors.colors,

        canvas: {
            width: 500,
            maxWidth: 500,
            gridSize: 500 / 8,
            halfGridSize: 500 / 16,
        },

        toggleSetup: false,
        gameEnded: false,
        winMessage: '',
        gameStarted: false,

        update: null,
        canvasElement: null,

        game: {},
    },

    mounted() {
        window.addEventListener('resize', this.handleResize);
    },

    methods: {
        generatePieces: generatePieces,
        generateOptions: generateOptions,

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
        },
        cancelSetup() {
            // reset player names entered
            this.players = this.players.map(player => ({ ...player, name: '' }));
            this.toggleSetup = false;
        },
        toggleWin() {
            this.handleGameEnd('win');
        },

        handleGameEnd(winType) {
            let winMessage;

            if (winType === 'draw') {
                winMessage = "It's a draw!";
            } else {
                const player = this.players[this.game.currentPlayer === 0 ? 1 : 0];
                const name = player.name ? player.name : player.default;
                winMessage = `${name} has won!`;
            }

            this.winMessage = winMessage;
            this.gameEnded = true;
        },

        setupNewGame() {
            const players = [{ id: 0, color: this.players[0].color }, { id: 1, color: this.players[1].color }];
            const newPieces = this.generatePieces();
            const newOptions = this.generateOptions(newPieces, 0, players);

            this.game = {
                ...this.game,
                currentPlayer: 0,
                pieces: newPieces,
                options: newOptions,
                selectedPiece: null,
                players,
            };
        },

        startGame() {
            this.setupNewGame();
            this.gameStarted = true;
        },

        handleRematch() {
            // reset default variables except from name
            this.gameEnded = false;
            this.winMessage = '';
            this.gameStarted = false;
        },

        fetchCanvasControls(update, canvasElement) {
            this.update = update;
            this.canvasElement = canvasElement;

            setTimeout(() => {
                this.canvasElement.addEventListener('click', this.clickHandler);

                // only works when run twice, I don't know why
                this.handleResize();
                setTimeout(this.handleResize);
            });
        },

        callCanvasRedraw(hasResized) {
            this.update(this.game, hasResized ? this.canvas : undefined);
        },

        endTurn() {
            // 1. if opponent has no new Pieces, win game
            // 2. if oppornent has no options, draw
            // 3. otherwise, it comes next players turn

            const opponentHasPieces = this.game.pieces.filter(piece => piece.player === this.game.currentPlayer).length > 0;

            if (!opponentHasPieces) return this.handleGameEnd('win');

            let opponentHasOptions = false;
            for (let option in this.game.options) {
                if (this.game.options[option].length > 0) {
                    opponentHasOptions = true;
                    break;
                }
            }

            if (!opponentHasOptions) return this.handleGameEnd('draw');
        },

        updateGame(selectedOption) {
            const newPieces = updatePieces(selectedOption, this.game.selectedPiece, this.game.pieces, this.game.currentPlayer);
            const newPlayer = nextPlayer(this.game.currentPlayer, this.game.players);
            const newOptions = this.generateOptions(newPieces, newPlayer, this.game.players);

            this.game = {
                ...this.game,
                pieces: newPieces,
                options: newOptions,
                selectedPiece: null,
                currentPlayer: newPlayer,
            };
        },

        clickHandler({ offsetX, offsetY }) {
            if (this.gameEnded) return;

            // if no piece is selected, cannot select an option..
            let selectedOption =
                this.game.selectedPiece === null
                    ? null
                    : checkOptionsClicked(this.game.options[this.game.selectedPiece], this.canvas.gridSize, offsetX, offsetY);

            if (selectedOption) {
                this.updateGame(selectedOption);
                this.callCanvasRedraw();
                this.endTurn();
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
        currentPlayer() {
            const player = this.players[this.game.currentPlayer];
            return player.name !== '' ? player.name : player.default;
        },
    },
});
