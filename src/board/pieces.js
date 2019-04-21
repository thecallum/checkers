import colors from './pieceColors';

class Piece {
    constructor(coords, color, id, isKing = false) {
        this.color = color;
        this.id = id;
        this.coords = coords;
        this.selected = false;
        this.king = isKing;
    }

    draw(gridSize, ctx, validOptions) {
        const radius = (gridSize /2) - 6;
        const x = (this.coords.x * gridSize) + (gridSize /2);
        const y = (this.coords.y * gridSize) + (gridSize /2);
        
        ctx.fillStyle = this.selected ? validOptions ? colors.green : colors.grey : this.color;
        
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