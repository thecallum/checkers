import React, { Component } from 'react';

import Canvas from '../components/Canvas';
import Layout from '../components/Layout';

import Modal from '../components/Modal';

import colors from '../board/pieceColors';

import generateOptions from '../board/generateOptions';
import updateSelectedPiece from '../board/updateSelectedPiece';
import generatePieces from '../board/generatePieces';
import clickHandler from '../board/clickHandler';
import endTurn from '../board/endTurn';

import handleCanvasResize from '../board/handleCanvasResize';
import canvasReady from '../board/canvasReady';
import handleGameEnd from '../board/handleGameEnd';
import startGame from '../board/startGame';

class PlayMultiPlayer extends Component {
    constructor(props) {
        super(props);

        this.canvasElement = null;
        this.updateCanvas = null;
        this.preUpdateCanvas = null;

        const width = window.innerWidth < 620 ? window.innerWidth - 20 : 600;
    
        this.state = {

            width: width,
            height: width,
            gridSize: width /8,
            halfGridSize: width /16,
         
            players: [
                { name: 'Player 1', color: colors.red },
                { name: 'Player 2', color: colors.blue }
            ],
            activePlayer: 0,

            pieces: [],
            options: [],

            selectedPiece: null,

            gameEnded: false,
            winMessage: null,
            gameStarted: false,

            setupModal__player1: '',
            setupModal__player2: '',
        }

        this.canvasReady = canvasReady.bind(this);
        this.handleGameEnd = handleGameEnd.bind(this);
        this.startGame = startGame.bind(this);

        this.handleCanvasResize = handleCanvasResize.bind(this);

        this.generateOptions = generateOptions.bind(this);
        this.updateSelectedPiece = updateSelectedPiece.bind(this);
        this.generatePieces = generatePieces.bind(this);
        this.clickHandler = clickHandler.bind(this);
        this.endTurn = endTurn.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.handleRematch = this.handleRematch.bind(this);
    }

    componentDidMount() {
        this.setState({ pieces: this.generatePieces() })

        window.addEventListener('resize', this.handleCanvasResize);
    }

    handleChange(e) {  
        this.setState({ [e.target.name]: e.target.value });
    }

    handleRematch() {
        // reset default variables except from name

        this.setState({
            activePlayer: 0,
            pieces: this.generatePieces(),
            options: [],
            selectedPiece: null, 
            gameEnded: false,
            winMessage: null,
            gameStarted: false
        })
    }

    render() {
        return (
            <div>
                <div className={(!this.state.gameStarted || this.state.gameEnded) ? 'blur' : ''}>
                    <Layout>

                        <div className="container">

                            <div className='canvasView'>
                                <div className='canvas__players'>
                                {
                                    this.state.players.map((player, index) => (
                                        <div className='canvas__player' key={index + 'a'}>
                                            <img src="" alt="" className='canvas__playerImg'/>
                                            <p className='canvas__playerName'>{ player.name }</p>
                                        </div>  
                                    ))
                                }
                                </div>

                                <div className='canvas__board'>
                                    <div className="canvas__container">
                                        <Canvas 
                                            ref={this.canvasRef}
                                            players={this.state.players}
                                            pieces={this.state.pieces}    
                                            options={this.state.options}
                                            canvasReady={this.canvasReady}
                                            selectedPiece={this.state.selectedPiece}

                                            width={this.state.width}
                                            height={this.state.height}
                                            gridSize={this.state.gridSize}
                                            halfGridSize={this.state.halfGridSize}
                                        />
                                    </div>
                                </div>

                                <div className="canvas__bottom">
                                    <h3 className='canvas__message'>It's {this.state.players[this.state.activePlayer].name}'s turn!</h3>
                                </div>
                            </div>
                        </div>

                    </Layout>
                    
                </div>

                {/* Game Setup Modal */}
                <Modal show={ !this.state.gameStarted }>
                    <h1 className="modal__title">Select Player Names</h1>

                    <div className="modal__form">
                        <div className='modal__formRow'>
                            <div className="modal__piece modal__piece--red"></div>
                            <input type="text" name='setupModal__player1' className="modal__input" placeholder='Player 1' value={this.state.setupModal_player1} onChange={this.handleChange}/>
                        </div>

                        <div className='modal__formRow'>
                            <div className="modal__piece modal__piece--blue"></div>
                            <input type="text" name='setupModal__player2' className="modal__input" placeholder='Player 2' value={this.state.setupModal_player2} onChange={this.handleChange}/>
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
                        <button className="button modal__button" onClick={() => this.props.history.push('/')}>Home</button>
                    </div>
                </Modal>

            </div>
        );
    }
}

export default PlayMultiPlayer;