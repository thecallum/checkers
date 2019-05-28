const { Piece } = require('./piece');


const colors = {
    'yellow': 'hsl(60, 80%, 50%)',
    'red': 'hsl(0, 50%, 50%)',
    'green': 'hsl(100, 50%, 50%)',
    'blue': 'hsl(220, 70%, 50%)',
    'grey': 'hsl(220, 5%, 70%)',
};


const generatePieces = ( player1 = 0, player2 = 1 ) => {
    let id = 0;
    const pieces = [];

    console.log({ player1, player2 })

    // bottom (first player in array)
    for (let row=0;row<3;row++) {
        for (let col=row%2===0?1:0;col<8;col+=2) {
            pieces.push(new Piece({x:col, y:7-row}, player1, id++, false, colors.red));
        }
    }

    // top (second player in array)
    for (let row=0;row<3;row++) {
        for (let col=row%2===0?0:1;col<8;col+=2) {
            pieces.push(new Piece({x:col, y:row}, player2, id++, false, colors.blue));
        }
    }

    return pieces;
}

module.exports = generatePieces;