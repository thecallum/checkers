const findClickedPiece = (pieces, currentPlayer, gridSize, halfGridSize, offsetX, offsetY) => {
    let foundPiece = false;

    for (let piece of pieces) {
        // ignore opponenets pieces
        if (piece.player !== currentPlayer) continue;

        const centerCoords = {
            x: (piece.coords.x * gridSize) + halfGridSize -6,
            y: (piece.coords.y * gridSize) + halfGridSize -6
        }

        const xDist = centerCoords.x > offsetX ? centerCoords.x - offsetX : offsetX - centerCoords.x;
        const yDist = centerCoords.y > offsetY ? centerCoords.y - offsetY : offsetY - centerCoords.y;

        // distance from center determines if user has clicked in the piece
        if (xDist <= halfGridSize -6 && yDist <= halfGridSize -6) {
            foundPiece = piece;
            break;
        }
    }  

    return foundPiece;
};


module.exports = findClickedPiece;