const nextPlayer = (currentPlayer, players) => {
    return currentPlayer === players[0].id ? players[1].id : players[0].id;
};

module.exports = nextPlayer;
