import colors from './pieceColors';

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
        
        // ctx.fillStyle = this.selected ? validOptions ? colors.green : colors.grey : this.color;
        
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

        if (this.king) {
            ctx.fillStyle = 'black';
            ctx.font = '36px Special Elite, cursive';
            ctx.fillText('K', x - 10, y + 12);    
        }
    }

    toggleActive(newState) {
        this.selected = newState;
    }
}

export default Piece