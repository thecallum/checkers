console.log('APP RUNNING');

import canvas from './components/canvas';
import Piece from './components/piece';
import generatePieces from './components/generatePieces';
import generateOptions from './components/generateOptions';

import modal from './components/modal';

new Vue({
    el: '#app',
    components: { canvasComponent: canvas, modal },
    data: {
        players: [
            { name: '', default: 'player 1', src: '#' },
            { name: '', default: 'player 2', src: '#' }
        ],

        gameEnded: false,
        winMessage: '',
        gameStarted: false,
        enabledClickHandler: false, // prevent multiple handlers on rematch

        // =============
        canvas: {
            width: 500,
            maxWidth: 500,
            gridSize: 500 / 8,
            halfGridSize: 500 /16,
        },
        // =============

        update: null,
        preDraw: null,
        canvasElement: null,

        game: {
            pieces: [],
            options: {},
            currentPlayer: 0,
            selectedPiece: null
        }

    },

    mounted() {
        const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
        this.canvas.width = width;
        this.canvas.gridSize = width / 8;
        this.canvas.halfGridSize = width / 16;

        window.addEventListener('resize', this.handleResize)
    },

    methods: {
        toggleWin() {
            this.winMessage = 'Test win';
            this.gameEnded = true;
        },

        fetchCanvasControls({ update, preDraw }, canvasElement) {
            console.log('Fetch, called from canvas component');

            // setup game env
            const newPieces = this.generatePieces();
            const newOptions = this.generateOptions(newPieces, 0);

            this.game = {
                ...this.game,
                pieces: newPieces,
                options: newOptions
            };

            this.update = update;
            this.preDraw = preDraw;
            this.canvasElement = canvasElement;

            this.preDraw();
        },

        callCanvasRedraw() {
            this.update(this.game);
        },

        generatePieces: generatePieces,

        generateOptions: generateOptions,

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

        handleGameEnd(winType) {
            let winMessage;
    
            if (winType === 'draw') {
                winMessage = 'It\'s a draw!';
            } else {
                const player = this.players[this.game.currentPlayer === 0 ? 1 : 0];
                const name = !!player.name ? player.name : player.default;
                winMessage = `${name} has won!`;
            }
        
            this.gameEnded = true;
            this.winMessage = winMessage;
        },

        startGame() {
            if (!this.enabledClickHandler) {
                this.enabledClickHandler = true;
                this.canvasElement.addEventListener('click', this.clickHandler);
            }
            
            this.gameStarted = true;
    
            this.callCanvasRedraw();
        },

        handleResize() {
            // 20px for padding
            const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
            this.canvas.width = width;
            this.canvas.gridSize = width / 8;
            this.canvas.halfGridSize = width / 16;


            setTimeout(this.gameStarted ? this.callCanvasRedraw : this.preDraw, 0);

        },

        handleRematch() {
            // reset default variables except from name

            const newPieces = this.generatePieces();
            const newOptions = this.generateOptions(newPieces, 0);

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

            // this.setState({
            //     gameEnded: false,
            //     winMessage: '',
            //     gameStarted: false
            // });
        },

        clickHandler({ offsetX, offsetY }) {
            if (this.gameEnded) return;
    
            const checkOptionsClicked = (options, gridSize) => {
                if (options.length === 0) return null;
    
                let selectedOption = null;
    
                for (let option of options) {
                    if (
                        offsetX > (option.end.x * gridSize) && 
                        offsetX < (option.end.x * gridSize) + gridSize &&
                        offsetY > (option.end.y * gridSize) && 
                        offsetY < (option.end.y * gridSize) + gridSize 
                    ) {
                        selectedOption = option;
                        break;
                    }
                }
    
                return selectedOption;
            }
    
            // if no piece is selected, cannot select an option..
            let selectedOption = this.game.selectedPiece ===  null ? null : checkOptionsClicked(this.game.options[this.game.selectedPiece], this.canvas.gridSize);       
            
            if (!!selectedOption) {
                // Option is selected! 
                // 
                // Move Piece and reset options
                // Then update turn
    
                const handleSelection = selectedOption => {
                    const kill = selectedOption.hasOwnProperty('kill');
                    const becomeKing = selectedOption.becomeKing;
        
                    const newPieces = this.game.pieces.filter(piece => {
                        // remove killed piece
                        return !(kill && piece.id === selectedOption.kill.id) 
                    }).map(piece => {
                        if (piece.id === this.game.selectedPiece) {
                            return new Piece(selectedOption.end, this.game.currentPlayer, piece.id, piece.king || becomeKing);
                        }
                        return piece;
                    });
    
                    const newPlayer = this.game.currentPlayer === 0 ? 1 : 0;
                    const newOptions = this.generateOptions(newPieces, newPlayer);
            
                    this.game = {
                        ...this.game,
                        pieces: newPieces,
                        options: newOptions,
                        selectedPiece: null,
                        currentPlayer: newPlayer,
                    };
                }
    
                handleSelection(selectedOption);
    
                this.callCanvasRedraw(this.game);    
    
                this.endTurn();
    
            } else {
                // player didnt't click an option, now check if a piece is selected
    
                const pieceClicked = (pieces, currentPlayer, gridSize, halfGridSize, offsetX, offsetY) => {
                    let foundPiece = false;
    
                    for (let piece of pieces) {
                        // ignore opponenets pieces
                        if (piece.player !== currentPlayer) continue;
            
                        const centerCoords = {
                            x: (piece.coords.x * gridSize) + halfGridSize -6,
                            y: (piece.coords.y * gridSize) + halfGridSize -6
                        }
            
                        const xDist = centerCoords.x > offsetX ? centerCoords.x - offsetX : offsetX - centerCoords.x;
                        const yDist = centerCoords.y > offsetY ? centerCoords.y - offsetY : offsetY - centerCoords.y;
            
                        // distance from center determines if user has clicked in the piece
                        if (xDist <= halfGridSize -6 && yDist <= halfGridSize -6) {
                            foundPiece = piece;
                            break;
                        }
                    }  
    
                    return foundPiece;
                }
        
                const foundPiece = pieceClicked(this.game.pieces, this.game.currentPlayer, this.canvas.gridSize, this.canvas.halfGridSize, offsetX, offsetY);
    
                if (!!foundPiece && foundPiece.id === this.game.selectedPiece) {
                    this.game.selectedPiece = null;
                } else if (!!foundPiece) {
                    this.game.selectedPiece = foundPiece.id;
                } else {
                    this.game.selectedPiece = null;
                }   
    
                this.callCanvasRedraw(this.game);    
            }
        }
    } 
})