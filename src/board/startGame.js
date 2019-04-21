const startGame = function() {
    // assign player names
    const p1 = this.state.setupModal__player1 || 'player 1';
    const p2 = this.state.setupModal__player2 || 'player 2';

    const newPlayers = this.state.players;

    newPlayers[0].name = p1;
    newPlayers[1].name = p2;

    this.setState({
        gameStarted: true,
        players: newPlayers
    }, () => {
        setTimeout(this.updateCanvas, 0);
    })
}

export default startGame;