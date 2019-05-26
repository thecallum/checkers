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

module.exports = Piece;