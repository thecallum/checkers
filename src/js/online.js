console.log('APP RUNNING');

import canvas from './components/canvas';
import Piece from './components/piece';
import generatePieces from './components/generatePieces';

import modal from './components/modal';

import io from 'socket.io-client';

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




        game: {
            pieces: [],
            options: {},
            currentPlayer: 0,
            selectedPiece: null
        },



        socket: null,
        connecting: true,
        socketerror: null,

        game: null,
        foundGame: null,
        state: 'connecting',

        accepted: false,
        opponentAccepted: false,

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

 
    },


    mounted() {
        const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
        this.canvas.width = width;
        this.canvas.gridSize = width / 8;
        this.canvas.halfGridSize = width / 16;

        window.addEventListener('resize', this.handleResize);

        console.log('Connecting to server');
        this.socket = io.connect('/');

        this.socket.on('error', error => {
            this.socketerror = error;
        })

        this.socket.on('connect', () => {
            this.connecting = false;
            this.state = 'connected';
        });

        this.socket.on('disconnect', () => {
            this.connecting = true;
            this.state = 'connecting';
        })

        this.socket.on('game', data => {
            if (!data.hasOwnProperty('state')) return;

            if (data.state === 'queue') {
                this.state = data.state;
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
                    selectedPiece: null
                };

                console.lo
                // start canvas animation

                // this.update({
                //     ...this.game, 
                //     clientUser: 1
                // });

                console.log('READY', data);


                if (!this.enabledClickHandler) {
                    this.enabledClickHandler = true;
                    this.canvasElement.addEventListener('click', this.clickHandler);
                }
                
                this.gameStarted = true;
        
                this.callCanvasRedraw();

                // this.callCanvasRedraw();
                return;
            }

            if (data.state === 'disconnect') {
                alert('Opponent disconnected!');
                this.state = data.state;
                return;
            }
        })
    },

    methods: {
        clickHandler({ offsetX, offsetY }) {
            if (this.gameEnded) return;
            console.log('click')
    
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
    
            console.log('check options', this.game, this.game.selectedPiece, this.game.options[this.game.selectedPiece], this.canvas.gridSize)
            // if no piece is selected, cannot select an option..
            let selectedOption = this.game.selectedPiece ===  null ? null : checkOptionsClicked(this.game.options[this.game.selectedPiece], this.canvas.gridSize);       
            
            if (!!selectedOption) {
                // Option is selected! 
                // 
                // Move Piece and reset options
                // Then update turn
    
                alert('OPTION SELECTED, TELL SERVER TO START NEXT TURN');
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
        },

        acceptGame() {
            if (this.accepted) return;
            console.log('game accepted');

            this.accepted = true;
            this.socket.emit('game', {
                state: 'accept',
                data: {
                    gameIndex: this.foundGame.roomIndex
                }
            })
        },
        rejectGame() {
            console.log('Game rejected');
        },
        joinQueue() {
            console.log('Clicked Join Queue');
            this.socket.emit('game', { state: 'join_queue' });
        },

        fetchCanvasControls({ update, preDraw }, canvasElement) {
            console.log('Fetch, called from canvas component');

            // setup game env
            // const newPieces = this.generatePieces();
            // const newOptions = this.generateOptions(newPieces, 0);

            // this.game = {
            //     ...this.game,
            //     pieces: newPieces,
            //     options: newOptions
            // };

            this.update = update;
            this.preDraw = preDraw;
            this.canvasElement = canvasElement;

            this.preDraw();

            // this.callCanvasRedraw();
        },

        callCanvasRedraw() {
            // console.log('Call update', this.game)
            this.update({
                ...this.game, 
                // clientUser: 1
            });
        },
        generatePieces: generatePieces,
        handleResize() {
            // 20px for padding
            const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
            this.canvas.width = width;
            this.canvas.gridSize = width / 8;
            this.canvas.halfGridSize = width / 16;


            setTimeout(this.gameStarted ? this.callCanvasRedraw : this.preDraw, 0);

        },

    }
})
