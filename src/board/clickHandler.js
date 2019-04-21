import Piece from './pieces';

const clickHandler = function({offsetX, offsetY}) {
    if (this.state.gameEnded) return;
    
    let selectedOption = null;
    let foundPiece = false;

    // console.log(this.state.pieces)
    // 1. check if user clicks inside an option (to move piece)
    if (this.state.options.length > 0) {
        for (let option of this.state.options) {
            if (
                offsetX > (option.end.x * this.state.gridSize) && 
                offsetX < (option.end.x * this.state.gridSize) + this.state.gridSize &&
                offsetY > (option.end.y * this.state.gridSize) && 
                offsetY < (option.end.y * this.state.gridSize) + this.state.gridSize 
            ) {
                selectedOption = option;
                break;
            }
        }
    }

    if (!!selectedOption) {
        // user has selected an option

        const kill = selectedOption.hasOwnProperty('kill');
        const becomeKing = selectedOption.becomeKing;

        this.setState(state => ({
            pieces: state.pieces.filter(piece => {
                // remove killed piece
                return !(kill && piece.id === selectedOption.kill.id) 
            }).map(piece => {
                // move piece to new coordinates
                if (piece.id === this.state.selectedPiece.id) {
                    return new Piece(selectedOption.end, piece.color, piece.id, piece.king || becomeKing);
                } 
                return piece;
            }),
            // update score if piece was killed
            players: !kill ? state.players : state.players.map((player, index) => {
                return index === state.activePlayer ? {
                    ...player,
                    score: state.players[state.activePlayer].score + 1
                } : player;
            })
        }), this.endTurn)
    } else {
        // player didnt't click an option, now check if a piece is selected
        const checkColor = this.state.players[this.state.activePlayer].color;

        for (let piece of this.state.pieces) {
            // ignore opponenets pieces
            if (piece.color !== checkColor) continue;

            const centerCoords = {
                x: (piece.coords.x * this.state.gridSize) + (this.state.gridSize /2) -6,
                y: (piece.coords.y * this.state.gridSize) + (this.state.gridSize /2) -6
            }

            const xDist = centerCoords.x > offsetX ? centerCoords.x - offsetX : offsetX - centerCoords.x;
            const yDist = centerCoords.y > offsetY ? centerCoords.y - offsetY : offsetY - centerCoords.y;

            // distance from center determines if user has clicked in the piece
            if (xDist <= (this.state.gridSize /2) -6 && yDist <= (this.state.gridSize /2) -6) {
                foundPiece = piece;
                break;
            }
        }
    }

    // update whether a piece is selected or unselected
    this.updateSelectedPiece(foundPiece).then(() => {
        this.updateCanvas();
    })

}

export default clickHandler;