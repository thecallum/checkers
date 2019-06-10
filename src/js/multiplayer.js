const generatePieces = require('./components/generatePieces');
const generateOptions = require('./components/generateOptions');
const findClickedPiece = require('./components/findClickedPiece');
const updatePieces = require('./components/updatePieces');
const nextPlayer = require('./components/nextPlayer');
const checkOptionsClicked = require('./components/checkOptionsClicked');
const setCanvasWidth = require('./components/setCanvasWidth');

const canvas = require('./components/canvas');
const modal = require('./components/modal');

new Vue({
    el: '#app',
    components: { canvasComponent: canvas, modal },
    data: {
        players: [{ name: '', default: 'player 1', src: '#' }, { name: '', default: 'player 2', src: '#' }],

        toggleSetup: false,
        gameEnded: false,
        winMessage: '',
        gameStarted: false,

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

        game: {
            pieces: [],
            options: {},
            currentPlayer: 0,
            selectedPiece: null,
        },
    },

    mounted() {
        // this.setCanvasWidth = this.setCanvasWidth.bind(this);

        this.setCanvasWidth();
        window.addEventListener('resize', this.handleResize);
    },

    methods: {
        setCanvasWidth: setCanvasWidth,
        generatePieces: generatePieces,
        generateOptions: generateOptions,

        beginSetup() {
            this.toggleSetup = true;
        },
        cancelSetup() {
            // remove player names entered
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

            this.gameEnded = true;
            this.winMessage = winMessage;
        },

        startGame() {
            console.log('start game');

            this.gameStarted = true;

            setTimeout(() => {
                // canvas was destroyed, need to create new clickHandler
                this.canvasElement.addEventListener('click', this.clickHandler);

                this.callCanvasRedraw();
            }, 0);
        },

        handleRematch() {
            // reset default variables except from name

            const newPieces = this.generatePieces();
            const newOptions = this.generateOptions(newPieces, 0, [0, 1]);

            this.game = {
                ...this.game,

                currentPlayer: 0,
                pieces: newPieces,
                options: newOptions,
                selectedPiece: null,
            };

            this.gameEnded = false;
            this.winMessage = '';
            this.gameStarted = false;
        },
        fetchCanvasControls({ update, preDraw }, canvasElement) {
            // setup game env
            const newPieces = this.generatePieces();
            const newOptions = this.generateOptions(newPieces, 0, [0, 1]);

            this.game = {
                ...this.game,
                pieces: newPieces,
                options: newOptions,
            };

            this.update = update;
            this.preDraw = preDraw;
            this.canvasElement = canvasElement;

            this.preDraw();
        },

        callCanvasRedraw() {
            this.update(this.game);
        },

        endTurn() {
            // 1. if opponent has no new Pieces, win game
            // 2. if oppornent has no options, draw
            // 3. otherwise, it comes next players turn

            const opponentHasPieces = this.game.pieces.filter(piece => piece.player === this.game.currentPlayer).length > 0;

            if (!opponentHasPieces) {
                this.handleGameEnd('win');
                return;
            }

            let opponentHasOptions = false;
            for (let option in this.game.options) {
                const currentOption = this.game.options[option];

                if (currentOption.length > 0) {
                    opponentHasOptions = true;
                    break;
                }
            }

            if (!opponentHasOptions) {
                this.handleGameEnd('draw');
                return;
            }
        },

        handleResize() {
            this.setCanvasWidth();
            setTimeout(this.gameStarted ? this.callCanvasRedraw : this.preDraw, 0);
        },

        clickHandler({ offsetX, offsetY }) {
            console.log('click');
            if (this.gameEnded) return;

            // if no piece is selected, cannot select an option..
            let selectedOption =
                this.game.selectedPiece === null
                    ? null
                    : checkOptionsClicked(this.game.options[this.game.selectedPiece], this.canvas.gridSize, offsetX, offsetY);

            if (selectedOption) {
                // Option is selected!
                //
                // Move Piece and reset options
                // Then update turn

                const newPieces = updatePieces(selectedOption, this.game.selectedPiece, this.game.pieces, this.game.currentPlayer);

                const newPlayer = nextPlayer(this.game.currentPlayer, [0, 1]);

                const newOptions = this.generateOptions(newPieces, newPlayer, [0, 1]);

                this.game = {
                    ...this.game,
                    pieces: newPieces,
                    options: newOptions,
                    selectedPiece: null,
                    currentPlayer: newPlayer,
                };

                this.callCanvasRedraw(this.game);

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

                this.callCanvasRedraw(this.game);
            }
        },
    },
});
