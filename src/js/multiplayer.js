console.log('APP RUNNING');

import canvas from './components/canvas';


const colors =  {
    'yellow': 'hsl(60, 80%, 50%)',
    'red': 'hsl(0, 50%, 50%)',
    'green': 'hsl(100, 50%, 50%)',
    'blue': 'hsl(220, 70%, 50%)',
    'grey': 'hsl(220, 5%, 70%)',
};

class Piece {
    constructor(coords, player, id, isKing = false) {
        this.player = player;
        this.id = id;
        this.coords = coords;
        this.king = isKing;
    }

    draw(gridSize, ctx, validOptions, selected) {
        const radius = (gridSize /2) - 6;
        const x = (this.coords.x * gridSize) + (gridSize /2);
        const y = (this.coords.y * gridSize) + (gridSize /2);
        
        
        if (selected && !validOptions) {
            ctx.fillStyle = colors.grey;
        } else if (selected) {
            ctx.fillStyle = colors.green;
        } else {
            ctx.fillStyle = colors[this.player === 0 ? 'red' : 'blue'];
        }
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 50, 0, 2*Math.PI);
        ctx.fill();

        if (this.king) this.drawKingOverlay(ctx, x, y)  ;
    }

    drawKingOverlay(ctx, x, y) {
        ctx.fillStyle = 'black';
        ctx.fillText('K', x - 10, y + 12);   
    }

    drawOptions(ctx, options, gridSize, halfGridSize) {
        for (let { start, end } of options) {

            // Calculate which direction arrow needs to point
            const xDir = start.x > end.x ? -1 : 1;
            const yDir = start.y > end.y ? -1 : 1;

            const gridCenter = {
                x: (end.x * gridSize) + halfGridSize,
                y: (end.y * gridSize) + halfGridSize
            };
        
            ctx.strokeStyle = colors.green;
            ctx.fillStyle = colors.green;
            ctx.lineWidth = 6;

            // line

            ctx.beginPath();
            ctx.moveTo((start.x * gridSize) + halfGridSize, (start.y * gridSize) + halfGridSize);
            ctx.lineTo(gridCenter.x, gridCenter.y);
            ctx.stroke();

            // arrow
            //      this layout may be more clunky, but its much easier to understand
            //      It's tilting the arrow according to its direction

            ctx.beginPath();

            if (xDir === -1) { // left
                if (yDir === -1) {
                    ctx.moveTo(gridCenter.x +15, gridCenter.y -5);
                    ctx.lineTo(gridCenter.x -5, gridCenter.y +15);
                    ctx.lineTo(gridCenter.x -6.5, gridCenter.y -7);
                } else {
                    ctx.moveTo(gridCenter.x +15, gridCenter.y +5);
                    ctx.lineTo(gridCenter.x -5, gridCenter.y -15);
                    ctx.lineTo(gridCenter.x -6.5, gridCenter.y +7);    
                }
            } else {
                if (yDir === -1) {
                    ctx.moveTo(gridCenter.x -15, gridCenter.y -5);
                    ctx.lineTo(gridCenter.x +5, gridCenter.y +15);
                    ctx.lineTo(gridCenter.x +6.5, gridCenter.y -7);
                } else {
                    ctx.moveTo(gridCenter.x -15, gridCenter.y +5);
                    ctx.lineTo(gridCenter.x +5, gridCenter.y -15);
                    ctx.lineTo(gridCenter.x +6.5, gridCenter.y +7);
                }
            }

            ctx.fill();
        }
    }
    // add draw options to piece
}


new Vue({
    el: '#app',
    components: { canvasComponent: canvas },
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

        generateOptions(pieces, currentPlayer) {
            const newOptions = {};

            for (let piece of pieces) {     
                newOptions[piece.id] = [];
                if (piece.player !== currentPlayer) continue;

    
                const coords = piece.coords;
    

                // a king can move in any direction
                // the direction will be set to null if a piece cannot move there (the board finishes)
                // not undefined means there is a piece is the way
    
                // 1. if undefined, space is empty (piece can move there)
                // 2. else, if square !null (square exists on board), check if piece is enemy
                // 3. If piece is enemy, check if square behind is empty (so piece can jump/kill enemy)
            
                if (piece.player === 0 || piece.king) {
                    const topRight = coords.x === 7 || coords.y === 0 ? null : pieces.filter(piece => piece.coords.x === coords.x +1 && piece.coords.y === coords.y -1)[0];
                    const topLeft = coords.x === 0  || coords.y === 0 ? null : pieces.filter(piece => piece.coords.x === coords.x -1 && piece.coords.y === coords.y -1)[0];
            
                    if (topRight === undefined) {
                        newOptions[piece.id].push({ 
                            start: coords, 
                            end: { x: coords.x +1, y: coords.y -1 },
                            becomeKing: coords.y === 1
                        });
                    } else if (topRight !== null && topRight.player !== piece.player) {
                        const behindTopRight = coords.x === 6 || coords.y === 1 ? null : pieces.filter(piece => piece.coords.x === coords.x +2 && piece.coords.y === coords.y -2)[0];
            
                        if (behindTopRight === undefined) {
                            newOptions[piece.id].push({ 
                                start: coords, 
                                end: { x: coords.x +2, y: coords.y -2 },
                                kill: topRight,
                                becomeKing: coords.y === 2
                            });
                        }
                    }
            
                    if (topLeft === undefined) {
                        newOptions[piece.id].push({ 
                            start: coords, 
                            end: { x: coords.x -1, y: coords.y -1 },
                            becomeKing: coords.y === 1
                        });
                    } else if (topLeft !== null && topLeft.player !== piece.player) {
                        const behindTopLeft = coords.x === 1 || coords.y === 1 ? null : pieces.filter(piece => piece.coords.x === coords.x -2 && piece.coords.y === coords.y -2)[0];
            
                        if (behindTopLeft === undefined) {
                            newOptions[piece.id].push({ 
                                start: coords, 
                                end: { x: coords.x -2, y: coords.y -2 }, 
                                kill: topLeft,
                                becomeKing: coords.y === 2
                            });
                        }
                    }
                }
            
                if (piece.player === 1 || piece.king) {
                    const bottomRight = coords.x === 7 || coords.y === 7 ? null : pieces.filter(piece => piece.coords.x === coords.x +1 && piece.coords.y === coords.y +1)[0];
                    const bottomLeft = coords.x === 0 || coords.y === 7 ? null : pieces.filter(piece => piece.coords.x === coords.x -1 && piece.coords.y === coords.y +1)[0];
            
                    if (bottomRight === undefined) {
                        newOptions[piece.id].push({ 
                            start: coords, 
                            end: { x: coords.x +1, y: coords.y +1 } ,
                            becomeKing: coords.y === 6
                        });
                    } else if (bottomRight !== null && bottomRight.player !== piece.player) {
                        const behindBottomRight = coords.x === 6 || coords.y === 6 ? null : pieces.filter(piece => piece.coords.x === coords.x +2 && piece.coords.y === coords.y +2)[0];
            
                        if (behindBottomRight === undefined) {
                            newOptions[piece.id].push({ 
                                start: coords, 
                                end: { x: coords.x +2, y: coords.y +2 },
                                kill: bottomRight,
                                becomeKing: coords.y === 5
                            });
                        }
                    }
            
                    if (bottomLeft === undefined) {
                        newOptions[piece.id].push({ 
                            start: coords, 
                            end: { x: coords.x -1, y: coords.y +1 },
                            becomeKing: coords.y === 6
                        });
                    } else if (bottomLeft !== null && bottomLeft.player !== piece.player) {
                        const behindBottomLeft = coords.x === 1 || coords.y === 6 ? null : pieces.filter(piece => piece.coords.x === coords.x -2 && piece.coords.y === coords.y +2)[0];
            
                        if (behindBottomLeft === undefined) {
                            newOptions[piece.id].push({ 
                                start: coords, 
                                end: { x: coords.x -2, y: coords.y +2 }, 
                                kill: bottomLeft,
                                becomeKing: coords.y === 5
                            });
                        }
                    }
                }
    
            }

            return newOptions;
        },

        endTurn() {
            // 1. if opponent has no new Pieces, win game
            // 2. if oppornent has no options, draw
            // 3. otherwise, it comes next players turn

            const opponentHasPieces = this.game.pieces.filter(piece => piece.player !== this.game.currentPlayer).length > 0;
        
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

        generatePieces() {
            let id = 0;
            const pieces = [];
        
            // bottom (first player in array)
            for (let row=0;row<3;row++) {
                for (let col=row%2===0?1:0;col<8;col+=2) {
                    pieces.push(new Piece({x:col, y:7-row}, 0, id++));
                }
            }
        
            // top (second player in array)
            for (let row=0;row<3;row++) {
                for (let col=row%2===0?0:1;col<8;col+=2) {
                    pieces.push(new Piece({x:col, y:row}, 1, id++));
                }
            }
        
            return pieces;
        },

        handleSetupModalInputs() {
            // const { name, value } = e.target;

            // this.setState(prev => ({
            //     players: prev.players.map((player, index) => index == name ? { name: value } : player)
            // }))
        },

        handleGameEnd(winType) {
            let winMessage;
    
            if (winType === 'draw') {
                winMessage = 'It\'s a draw!';
            } else {
                winMessage = `${this.state.players[this.game.currentPlayer === 0 ? 1 : 0].name} has won!`;
            }
        
            this.gameEnded = true;
            this.winMessage = winMessage;
        },

        startGame() {
            if (!this.enabledClickHandler) {
                this.enabledClickHandler = true;
                this.canvasElement.addEventListener('click', this.clickHandler);
                window.addEventListener('resize', this.handleResize)
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


            setTimeout(this.callCanvasRedraw, 0);

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