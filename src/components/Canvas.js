import React, { Component } from 'react';
import colors from '../board/pieceColors';

import loadFont from '../board/loadFont';

class Canvas extends Component {
    constructor(props) {
        super(props);

        this.gamestate = {};

        this.canvas = React.createRef();    
        this.ctx = null;

        this.preDraw = this.preDraw.bind(this);
        this.updateCanvas = this.updateCanvas.bind(this);
    }

    componentDidMount() {
        this.ctx = this.canvas.current.getContext('2d');

        loadFont(this.ctx, 'Special Elite', 36);

        const controls = {
            update: this.updateCanvas,
            preDraw: this.preDraw
        };

        this.props.fetchCanvasControls(controls, this.canvas.current);
    }

    updateCanvas(state) {
        this.gameState = state;

        this.clearCanvas();
        this.drawGrid();
        this.drawPieces();
        this.drawOptions();

        if (!!this.gameState.selectedPiece) this.drawSelectedPiece();
    }

    clearCanvas() {
        this.ctx.clearRect(0,0, this.props.width, this.props.height);
    }

    drawGrid() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.props.width, this.props.height);

        this.ctx.fillStyle = 'black';
        for (let row=0;row<8;row++) {
            for (let col=0;col<8;col++) {
                if ((row%2===0 && col%2===0) || (row%2===1 && col%2===1)) {
                    this.ctx.fillRect(this.props.gridSize * col ,row*this.props.gridSize,this.props.gridSize,this.props.gridSize);
                }
            }
        }
    }

    drawPieces() {
        this.gameState.pieces.map(piece => {
            const isSelected = piece.id === this.gameState.selectedPiece;
            const availableOptions = this.gameState.options[piece.id].length > 0;
            piece.draw(this.props.gridSize, this.ctx, availableOptions, isSelected);
        });
    }

    drawOptions() {
        if (this.gameState.selectedPiece === null) return;

        const selectedPiece = this.gameState.selectedPiece;
        const selectedOptions = this.gameState.options[selectedPiece];

        this.gameState.pieces[selectedPiece].drawOptions(this.ctx, selectedOptions, this.props.gridSize, this.props.halfGridSize);
    }

    drawSelectedPiece() {
        const pieceID = this.gameState.selectedPiece;
        const availableOptions = this.gameState.options[pieceID].length > 0;

        this.gameState.pieces.filter(piece => piece.id === pieceID)[0].draw(this.props.gridSize, this.ctx, availableOptions, true);
    }

    preDraw() {
        // only draw grid (before player starts game)
        this.drawGrid();
    }    
    
    render() {
        return (
            <canvas
                width={this.props.width}
                height={this.props.height}
                className='canvas'
                ref={this.canvas}
            />
        )
    }
}

export default Canvas;