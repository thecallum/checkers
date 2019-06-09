const { Piece } = require('./piece');
const colors = require('./colors');

const generatePieces = (player1 = 0, player2 = 1) => {
	let id = 0;
	const pieces = [];

	// bottom (first player in array)
	for (let row = 0; row < 3; row++) {
		for (let col = row % 2 === 0 ? 1 : 0; col < 8; col += 2) {
			pieces.push(new Piece({ x: col, y: 7 - row }, player1, id++, false, colors.red));
		}
	}

	// top (second player in array)
	for (let row = 0; row < 3; row++) {
		for (let col = row % 2 === 0 ? 0 : 1; col < 8; col += 2) {
			pieces.push(new Piece({ x: col, y: row }, player2, id++, false, colors.blue));
		}
	}

	return pieces;
};

module.exports = generatePieces;
