const nextPlayer = (currentPlayer, players) => {
	return currentPlayer === players[0] ? players[1] : players[0];
};

module.exports = nextPlayer;
