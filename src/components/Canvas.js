import React, { Component } from 'react';
import colors from '../board/pieceColors';

// pass draw prob to redraw

class Canvas extends Component {
    constructor(props) {
        super(props);

        this.canvas = React.createRef();
    
        this.ctx = null;

        //
        // this.draw = this.draw.bind(this);
        this.preDraw = this.preDraw.bind(this);

        // this.drawGrid = this.drawGrid.bind(this);
        // this.drawPieces = this.drawPieces.bind(this);
        // this.drawOptions = this.drawOptions.bind(this);

        this.updateCanvas = this.updateCanvas.bind(this);

        this.clearCanvas = this.clearCanvas.bind(this);

        this.gamestate = {};
    }

    componentDidMount() {

        console.log('canvas mounted', this.canvas);

        // console.log('props', this.props)

        

        this.ctx = this.canvas.current.getContext('2d');



        // const canvas = this.canvas.current;

        this.props.fetchCanvasControls({
            update: this.updateCanvas,
            preDraw: this.preDraw
        }, this.canvas.current);
        // const draw = this.draw;
        // const preDraw = this.preDraw;

        // this.props.canvasReady({ canvas, draw, preDraw });
    }

    updateCanvas(state) {
        this.gameState = state;

        this.clearCanvas();
        this.drawGrid()
        this.drawPieces();
        this.drawOptions();
    }

    clearCanvas() {
        this.ctx.clearRect(0,0, this.props.width, this.props.height);
    }

    preDraw() {
        // only draw grid (before player starts game)
        this.drawGrid();
    }
    draw() {
        // this.ctx.clearRect(0,0, this.props.width, this.props.height);
        this.drawGrid();
        this.drawPieces();
        this.drawOptions();

        //  draw selected piece
        if (!!this.props.selectedPiece) {
            this.props.selectedPiece.draw(this.props.gridSize, this.ctx, !!this.props.options.length);
        }
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

        // console.log('draw Pieces', this.gameState);
        this.gameState.pieces.map(piece => {
            const isSelected = piece.id === this.gameState.selectedPiece;
            const availableOptions = this.gameState.options[piece.id].length > 0;
            piece.draw(this.props.gridSize, this.ctx, availableOptions, isSelected);
        });
    }
    drawOptions() {
        if (!this.gameState.selectedPiece) return;

        const selected = this.gameState.options[this.gameState.selectedPiece];

        for (let { start, end } of selected) {

            // Calculate which direction arrow needs to point
            const xDir = start.x > end.x ? -1 : 1;
            const yDir = start.y > end.y ? -1 : 1;

            const gridCenter = {
                x: (end.x * this.props.gridSize) + this.props.halfGridSize,
                y: (end.y * this.props.gridSize) + this.props.halfGridSize
            };
        
            this.ctx.strokeStyle = colors.green;
            this.ctx.fillStyle = colors.green;
            this.ctx.lineWidth = 6;

            // line

            this.ctx.beginPath();
            this.ctx.moveTo((start.x * this.props.gridSize) + this.props.halfGridSize, (start.y * this.props.gridSize) + this.props.halfGridSize);
            this.ctx.lineTo(gridCenter.x, gridCenter.y);
            this.ctx.stroke();

            // arrow
            //      this layout may be more clunky, but its much easier to understand
            //      It's tilting the arrow according to its direction

            this.ctx.beginPath();

            if (xDir === -1) { // left
                if (yDir === -1) {
                    this.ctx.moveTo(gridCenter.x +15, gridCenter.y -5);
                    this.ctx.lineTo(gridCenter.x -5, gridCenter.y +15);
                    this.ctx.lineTo(gridCenter.x -6.5, gridCenter.y -7);
                } else {
                    this.ctx.moveTo(gridCenter.x +15, gridCenter.y +5);
                    this.ctx.lineTo(gridCenter.x -5, gridCenter.y -15);
                    this.ctx.lineTo(gridCenter.x -6.5, gridCenter.y +7);    
                }
            } else {
                if (yDir === -1) {
                    this.ctx.moveTo(gridCenter.x -15, gridCenter.y -5);
                    this.ctx.lineTo(gridCenter.x +5, gridCenter.y +15);
                    this.ctx.lineTo(gridCenter.x +6.5, gridCenter.y -7);
                } else {
                    this.ctx.moveTo(gridCenter.x -15, gridCenter.y +5);
                    this.ctx.lineTo(gridCenter.x +5, gridCenter.y -15);
                    this.ctx.lineTo(gridCenter.x +6.5, gridCenter.y +7);
                }
            }

            this.ctx.fill();
        }
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