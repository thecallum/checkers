import Piece from './pieces';

const generatePieces = function() {
    let id = 0;
    const pieces = [];
    const [player_1, player_2] = this.state.players; 

    // bottom (first player in array)
    for (let row=0;row<3;row++) {
        for (let col=row%2===0?1:0;col<8;col+=2) {
            pieces.push(new Piece({x:col, y:7-row}, player_1.color, id++));
        }
    }

    // top (second player in array)
    for (let row=0;row<3;row++) {
        for (let col=row%2===0?0:1;col<8;col+=2) {
            pieces.push(new Piece({x:col, y:row}, player_2.color, id++));
        }
    }

    return pieces;
}

export default generatePieces;