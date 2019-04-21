const endTurn = function() {
    // check is oponent has remaining pieces, or if they cannot move any of their pieces
    const opponentsPieces = this.state.pieces.filter(piece => piece.color !== this.state.players[this.state.activePlayer].color)

    if (opponentsPieces.length === 0) {
        this.handleGameEnd('win');
        return;
    } 

    // check if player has any more options
    let hasOptions = false;

    for (let piece of opponentsPieces) {
        const newOptions = this.generateOptions(piece, this.state.activePlayer === 0 ? 1 : 0);

        if (newOptions.length) {
            hasOptions = true;
            break
        }
    }

    if (!hasOptions) {
        this.handleGameEnd('draw');
        return;
    }
   
    this.setState(state => ({ activePlayer: state.activePlayer === 0 ? 1 : 0 }))
}

export default endTurn;