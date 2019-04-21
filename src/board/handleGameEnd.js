const handleGameEnd = function(winType) {
    let winMessage;

    if (winType === 'draw') {
        winMessage = 'It\'s a draw!';
    } else {
        winMessage = `${this.state.players[this.state.activePlayer].name} has won!`;
    }

    this.setState({
        gameEnded: true,
        winMessage
    });
} 

export default handleGameEnd;