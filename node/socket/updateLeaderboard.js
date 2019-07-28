const { update } = require('../models/leaderboard');
const logger = require('../logger');

module.exports = (winType, currentPlayer, players) =>
    new Promise(async (resolve, reject) => {
        try {
            if (winType === 'draw') {
                await Promise.all([update('draw', players[0].id), update('draw', players[1].id)]);
            } else {
                const winnerID = players.filter(player => player.sessionID === currentPlayer)[0].id;
                const loserID = players.filter(player => player.sessionID !== currentPlayer)[0].id;
                await Promise.all([update('win', winnerID), update('lose', loserID)]);
            }

            resolve();
        } catch (e) {
            logger.error(e);
            reject(e);
        }
    });
