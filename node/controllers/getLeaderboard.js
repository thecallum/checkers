const { get } = require('../models/leaderboard');

module.exports = (offset = 0) => new Promise(async resolve => resolve(await get(offset)));
