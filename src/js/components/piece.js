const colors = require('./colors');

class Piece {
    constructor(coords, player, id, isKing = false, color = 'white') {
        this.player = player;
        this.id = id;
        this.coords = coords;
        this.king = isKing;
        this.color = color;
    }
}

const draw = (piece, gridSize, ctx, validOptions, selected, color) => {
    const radius = (gridSize / 2) - 6;
    const x = (piece.coords.x * gridSize) + (gridSize / 2);
    const y = (piece.coords.y * gridSize) + (gridSize / 2);

    if (selected && !validOptions) {
        ctx.fillStyle = colors.grey;
    } else if (selected) {
        ctx.fillStyle = colors.green;
    } else {
        ctx.fillStyle = color;
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 50, 0, 2 * Math.PI);
    ctx.fill();

    if (piece.king) drawKingOverlay(ctx, x, y);
}

const drawKingOverlay = (ctx, x, y) => {
    ctx.fillStyle = 'black';
    ctx.fillText('K', x - 10, y + 12);
}

const drawOptions = (ctx, options, gridSize, halfGridSize) => {
    for (let { start, end }
        of options) {

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
                ctx.moveTo(gridCenter.x + 15, gridCenter.y - 5);
                ctx.lineTo(gridCenter.x - 5, gridCenter.y + 15);
                ctx.lineTo(gridCenter.x - 6.5, gridCenter.y - 7);
            } else {
                ctx.moveTo(gridCenter.x + 15, gridCenter.y + 5);
                ctx.lineTo(gridCenter.x - 5, gridCenter.y - 15);
                ctx.lineTo(gridCenter.x - 6.5, gridCenter.y + 7);
            }
        } else {
            if (yDir === -1) {
                ctx.moveTo(gridCenter.x - 15, gridCenter.y - 5);
                ctx.lineTo(gridCenter.x + 5, gridCenter.y + 15);
                ctx.lineTo(gridCenter.x + 6.5, gridCenter.y - 7);
            } else {
                ctx.moveTo(gridCenter.x - 15, gridCenter.y + 5);
                ctx.lineTo(gridCenter.x + 5, gridCenter.y - 15);
                ctx.lineTo(gridCenter.x + 6.5, gridCenter.y + 7);
            }
        }

        ctx.fill();
    }
}


module.exports = {
    Piece,
    draw,
    drawOptions
}