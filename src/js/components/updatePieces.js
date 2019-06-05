const { Piece } = require('./piece');

const updatePieces = (selectedOption, selectedPiece, pieces, currentPlayer) => {
    const kill = selectedOption.hasOwnProperty('kill');
    const becomeKing = selectedOption.becomeKing;

    const newPieces = pieces.filter(piece => {
        // remove killed piece
        return !(kill && piece.id === selectedOption.kill.id)
    }).map(piece => {
        if (piece.id === selectedPiece) {
            return new Piece(selectedOption.end, currentPlayer, piece.id, piece.king || becomeKing, piece.color);
        }
        return piece;
    });

    return newPieces;
}

module.exports = updatePieces;