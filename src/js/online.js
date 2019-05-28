console.log('APP RUNNING');

import canvas from './components/canvas';
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
        canvasElement: null
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
                this.accepted = false;
                this.opponentAccepted = false;
                this.foundGame = null;

                this.preDraw();

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

                // console.log('BEFORE READY', this.game)

                console.log('READY', data);

                if (!this.enabledClickHandler) {
                    this.enabledClickHandler = true;
                    this.canvasElement.addEventListener('click', this.clickHandler);
                }
                
                this.gameStarted = true;
    
                this.callCanvasRedraw();
                return;
            }

            if (data.state === 'new_turn') {
                console.log('NEW TURN', data);


            this.game = {
                ...data.data.game,
                selectedPiece: null   
            };

                this.callCanvasRedraw();
                
            }

            if (data.state === 'disconnect') {
                this.state = data.state;

                alert('Opponent disconnected!');
                return;
            }
        })
    },

    methods: {
        clickHandler({ offsetX, offsetY }) {
            if (this.gameEnded || this.game.currentPlayer !== this.socket.id) return;
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
    
            // console.log('check options', this.game.options[this.game.selectedPiece])
            // if no piece is selected, cannot select an option..
            let selectedOption = this.game.selectedPiece ===  null ? null : checkOptionsClicked(this.game.options[this.game.selectedPiece], this.canvas.gridSize);       
            
            if (!!selectedOption) {
                // Option is selected! 
                // 
                
                console.log({ selectedOption })
 
                // alert('OPTION SELECTED, TELL SERVER TO START NEXT TURN');

                const move = {
                    selectedOption,
                    selectedPiece: this.game.selectedPiece 
                };

               // send data to server
               this.socket.emit('game', {
                    state: 'submit_turn',
                    data: {
                        move,
                    }
               });
    
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
                console.log({ foundPiece })

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
    }
})
