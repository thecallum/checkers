// import loadFont from './loadFont';

const loadFont = require('./loadFont')

const { Piece, draw: drawPiece, drawOptions } = require('./piece');

const canvas = {
    props: {
        fetchCanvasControls: { type: Function, required: true },
        width: { type: Number, required: true },
        gridSize: { type: Number, required: true },
        halfGridSize: { type: Number, required: true },
        maxWidth: { type: Number, required: true },        
    },
    data: function() {
        return {
            gameState: {}, // passed in when game is to be updated
            
            canvas: null,
            ctx: null,

        }
    },
    mounted() {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');

        // load font
        loadFont(this.ctx, 'Special Elite', 36);
        
        // controlls passed back to app to rerender the canvas
        const controls = {
            update: this.update,
            preDraw: this.preDraw
        }

        this.fetchCanvasControls(controls, this.canvas);

    },
    methods: {

        update(state) {

            this.gameState = state;
            this.clearCanvas();
            this.drawGrid();
            this.drawPieces();

            console.log({ clientUser: this.gameState.clientUser, currentPlayer: this.gameState.currentPlayer })

            if (!this.gameState.clientUser || this.gameState.clientUser === this.gameState.currentPlayer) {
                console.log('Draw options');
                this.drawOptions();

                if (!!this.gameState.selectedPiece) this.drawSelectedPiece();

            }
            
        },

        preDraw() {
            // only draw grid (before player starts game)
            this.drawGrid();

        },

        clearCanvas() {
            this.ctx.clearRect(0,0, this.width, this.width);
        },

        drawGrid() {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.width, this.width);

            this.ctx.fillStyle = 'black';
            for (let row=0;row<8;row++) {
                for (let col=0;col<8;col++) {
                    if ((row%2===0 && col%2===0) || (row%2===1 && col%2===1)) {
                        this.ctx.fillRect(this.gridSize * col ,row*this.gridSize,this.gridSize,this.gridSize);
                    }
                }
            }
        },

        drawPieces() {
            // console.log('Draw Pieces', this.gameState)
            this.gameState.pieces.map(piece => {
                const isSelected = piece.id === this.gameState.selectedPiece;
                const availableOptions = this.gameState.options[piece.id].length > 0;
                // console.log('canvas draws pieces', piece)
                // piece.draw(this.gridSize, this.ctx, availableOptions, isSelected);

                drawPiece(piece, this.gridSize, this.ctx, availableOptions, isSelected);
            });
        },

        drawOptions() {
            if (this.gameState.selectedPiece === null) return;
    
            const selectedPieceId = this.gameState.selectedPiece;

            const selectedPiece = this.gameState.pieces.filter(piece => piece.id === selectedPieceId)[0];

            const selectedOptions = this.gameState.options[selectedPieceId];
            
            // selectedPiece.drawOptions(this.ctx, selectedOptions, this.gridSize, this.halfGridSize);
            drawOptions(this.ctx, selectedOptions, this.gridSize, this.halfGridSize);
        },

        drawSelectedPiece() {
            const pieceID = this.gameState.selectedPiece;
            const availableOptions = this.gameState.options[pieceID].length > 0;
    
            // this.gameState.pieces.filter(piece => piece.id === pieceID)[0].draw(this.gridSize, this.ctx, availableOptions, true);
            const selectedPiece = this.gameState.pieces.filter(piece => piece.id === pieceID)[0];
            drawPiece(selectedPiece, this.gridSize, this.ctx, availableOptions, true);
        }
    },
    template: (`
        <canvas 
            id='canvas' 
            class='canvas'

            :width='width' 
            :height='width'

            ref='canvas'
        >

        </canvas>
    `),
}

export default canvas;