module.exports = (currentPlayer, players) => (currentPlayer === players[0].id ? players[1].id : players[0].id);
