const { draw: drawPiece, drawOptions } = require('../game_modules/piece');

module.exports = {
    props: {
        fetchCanvasControls: {
            type: Function,
            required: true,
        },
    },
    data: function() {
        return {
            gameState: {}, // passed in when game is to be updated

            canvas: null,
            ctx: null,

            width: 500,
            maxWidth: 500,
            gridSize: 500 / 8,
            halfGridSize: 500 / 16,
        };
    },
    mounted() {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = this.width;
        this.canvas.height = this.width;

        // pass methods to update the canvas
        this.fetchCanvasControls(this.update, this.canvas);
    },
    methods: {
        update(newState, newSize) {
            if (typeof newState === 'undefined') {
                this.preDraw();
            } else {
                this.gameState = newState;

                if (typeof newSize !== 'undefined') {
                    this.resize(newSize.width, newSize.gridSize, newSize.halfGridSize);
                } else {
                    this.draw();
                }
            }
        },

        resize(width, gridSize, halfGridSize) {
            // https: //stackoverflow.com/questions/8693949/resize-html5-canvas-element
            // Creating temp canvas to hide resize clearing canvas

            this.width = width;
            this.gridSize = gridSize;
            this.halfGridSize = halfGridSize;

            const tempCanvas = document.createElement('canvas');

            tempCanvas.height = this.width;
            tempCanvas.width = this.width;

            tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0);

            this.canvas.width = this.width;
            this.canvas.height = this.width;

            this.draw();
        },

        draw() {
            this.clearCanvas();
            this.drawGrid();
            this.drawPieces();
            this.drawOptions();

            if (this.gameState.selectedPiece) this.drawSelectedPiece();
        },

        preDraw() {
            // only draw grid (before player starts game)
            this.drawGrid();
        },

        clearCanvas() {
            this.ctx.clearRect(0, 0, this.width, this.width);
        },

        drawGrid() {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.width, this.width);

            this.ctx.fillStyle = 'black';
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if ((row % 2 === 0 && col % 2 === 0) || (row % 2 === 1 && col % 2 === 1)) {
                        this.ctx.fillRect(this.gridSize * col, row * this.gridSize, this.gridSize, this.gridSize);
                    }
                }
            }
        },

        drawPieces() {
            const colors = Object.keys(this.gameState.players).map(player => this.gameState.players[player].color);

            this.gameState.pieces.map(piece => {
                const isSelected = piece.id === this.gameState.selectedPiece;
                const availableOptions = this.gameState.options[piece.id].length > 0;

                const usePrimaryColor = colors[0] != colors[1] ? true : this.gameState.activePlayer === piece.player;
                const color = this.gameState.players.filter(player => player.id === piece.player)[0].color;
                drawPiece(usePrimaryColor, piece, this.gridSize, this.ctx, availableOptions, isSelected, color, this.gameState.upsideDown);
            });
        },

        drawOptions() {
            if (this.gameState.selectedPiece === null) return;

            const selectedPieceId = this.gameState.selectedPiece;
            const selectedOptions = this.gameState.options[selectedPieceId];

            drawOptions(this.ctx, selectedOptions, this.gridSize, this.halfGridSize);
        },

        drawSelectedPiece() {
            const colors = Object.keys(this.gameState.players).map(player => this.gameState.players[player].color);

            const pieceID = this.gameState.selectedPiece;
            const availableOptions = this.gameState.options[pieceID].length > 0;

            const usePrimaryColor = colors[0] == colors[1] ? true : this.gameState.activePlayer === selectedPiece;

            const selectedPiece = this.gameState.pieces.filter(piece => piece.id === pieceID)[0];
            drawPiece(usePrimaryColor, selectedPiece, this.gridSize, this.ctx, availableOptions, true);
        },
    },
    template: `
        <canvas 
            id='canvas' 
            class='canvas'

            ref='canvas'
        ></canvas>
    `,
};
