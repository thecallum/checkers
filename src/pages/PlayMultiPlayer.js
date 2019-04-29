import React, { Component } from 'react';

import Canvas from '../components/Canvas';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Piece from '../board/Piece';

import generatePieces from '../board/generatePieces';

class PlayMultiPlayer extends Component {
    constructor(props) {
        super(props);

        this.updateGame = null;
        this.canvasElement = null;

        this.state = {
            gameEnded: false,
            winMessage: '',
            gameStarted: false,
            clickHandler: false,

            players: [
                { name: '' },
                { name: '' }
            ],

            width: 500, // width and height
            gridSize: 500 /8,
            halfGridSize: 500 / 16,

        };

        this.game = {
            pieces: [],
            options: {},
            currentPlayer: 0,
            selectedPiece: null,
        };

        this.fetchCanvasControls = this.fetchCanvasControls.bind(this);

        this.generatePieces = generatePieces.bind(this);
        this.generateOptions = this.generateOptions.bind(this);
        this.clickHandler = this.clickHandler.bind(this);

        this.callCanvasRedraw = this.callCanvasRedraw.bind(this);

        this.endTurn = this.endTurn.bind(this);
        this.handleGameEnd = this.handleGameEnd.bind(this);
        this.handleSetupModalInputs = this.handleSetupModalInputs.bind(this);
        this.startGame = this.startGame.bind(this);
        this.handleRematch = this.handleRematch.bind(this);

        this.handleResize = this.handleResize.bind(this);
    };

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        // canvas max width 500px
        // if window is smaller, shrink canvas

        const newCanvasWidth = window.innerWidth > 500 ? 520 : window.innerWidth - 20;

        this.setState({
            width: newCanvasWidth,
            gridSize: newCanvasWidth / 8,
            halfGridSize: newCanvasWidth / 16,
        }, this.callCanvasRedraw);
    }

    fetchCanvasControls(controls, canvasElement) {
        // called by Canvas, passed as prop
        const newPieces = this.generatePieces();
        const newOptions = this.generateOptions(newPieces, 0);

        this.game = {
            ...this.game,
            pieces: newPieces,
            options: newOptions
        };

        this.updateGame = controls.update;
        this.canvasElement = canvasElement; 
        
        // draws grid
        controls.preDraw();
    }

    callCanvasRedraw() {
        this.updateGame(this.game)
    }

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
    }

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
       
    }

    handleSetupModalInputs(e) {
        const { name, value } = e.target;

        this.setState(prev => ({
            players: prev.players.map((player, index) => index == name ? { name: value } : player)
        }))
    }

    handleGameEnd(winType) {
        let winMessage;
    
        if (winType === 'draw') {
            winMessage = 'It\'s a draw!';
        } else {
            winMessage = `${this.state.players[this.game.currentPlayer === 0 ? 1 : 0].name} has won!`;
        }
    
        this.setState({ gameEnded: true, winMessage });
    } 

    startGame() {

        if (!this.state.clickHandler) {
            this.setState({ clickHandler: true });
            this.canvasElement.addEventListener('click', this.clickHandler)
        }
        
        this.setState({ gameStarted: true });

        this.callCanvasRedraw(this.game);
    }

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

        this.setState({
            gameEnded: false,
            winMessage: '',
            gameStarted: false
        });
    }

    clickHandler({offsetX, offsetY}) {
        if (this.state.gameEnded) return;
    
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
        let selectedOption = !this.game.selectedPiece ? null : checkOptionsClicked(this.game.options[this.game.selectedPiece], this.state.gridSize);       
        
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
                        return new Piece(selectedOption.end, this.game.currentPlayer, piece.id, becomeKing);
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
    
            const foundPiece = pieceClicked(this.game.pieces, this.game.currentPlayer, this.state.gridSize, this.state.halfGridSize, offsetX, offsetY);

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

    render() {
        return (
            <div>

                <Layout>
                
                    <div className="container">

                        <div className='canvasView'>
                            <div className='canvas__players'>
                            {
                                this.state.players.map((player, index) => (
                                    <div className='canvas__player' key={index + 'a'}>
                                        <img src="" alt="" className='canvas__playerImg'/>
                                        <p className='canvas__playerName'>{ player.name || `Player ${index + 1}` }</p>
                                    </div>  
                                ))
                            }
                            </div>

                            <div className='canvas__board'>
                                <div className="canvas__container">
                                    <Canvas 
                                        fetchCanvasControls={this.fetchCanvasControls}
                                        width={this.state.width}
                                        height={this.state.width}
                                        gridSize={this.state.gridSize}
                                        halfGridSize={this.state.halfGridSize}
                                    />
                                </div>
                            </div>

                            <div className="canvas__bottom">
                                {/* <h3 className='canvas__message'>It's {this.game.players[this.game.activePlayer].name}'s turn!</h3> */}
                                <h3 className='canvas__message'>
                                {
                                    (this.state.gameStarted && !this.state.gameEnded) && `It's ${this.state.players[0].name}'s turn!`
                                }
                                </h3>

                            </div>
                        </div>
                    </div>

                    <button onClick={() => this.setState({ gameEnded: true, winMessage: 'Some win message' })}>Win</button>

                </Layout>

                {/* Game Setup Modal */}
                <Modal show={ !this.state.gameStarted }>
                    <h1 className="modal__title">Select Player Names</h1>

                    <div className="modal__form">
                        <div className='modal__formRow'>
                            <div className="modal__piece modal__piece--red"></div>
                            <input type="text" className="modal__input" name='0'placeholder='Player 1' value={this.state.players[0].name} onChange={this.handleSetupModalInputs}/>
                        </div>

                        <div className='modal__formRow'>
                            <div className="modal__piece modal__piece--blue"></div>
                            <input type="text" className="modal__input" name='1' placeholder='Player 2' value={this.state.players[1].name} onChange={this.handleSetupModalInputs}/>
                        </div>
                    </div>

                    <div className="modal__options">
                        <button className="button modal__button" onClick={this.startGame}>Start</button>
                    </div>
                </Modal>

                {/* Game End Modal */}
                <Modal show={this.state.gameEnded}>
                    <h1 className="modal__title">Game Ended</h1>
                    <p className="modal__message">{ this.state.winMessage }</p>
                    <div className="modal__options">
                        <button className="button modal__button" onClick={this.handleRematch}>Rematch</button>
                        <button className="button modal__button" onClick={() => this.endTurn('win')}>Home</button>
                    </div>
                </Modal>


                </div>
        )
    }
}

export default PlayMultiPlayer;