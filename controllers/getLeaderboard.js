const { get } = require('../models/leaderboard');

const getLeaderboard = (offset = 0) => new Promise(async resolve => resolve(await get(offset)));

module.exports = getLeaderboard;
