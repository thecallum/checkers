const generateOptions = function(piece, player) {
    // only run if a piece is selected
    if (!piece) return [];

    const coords = piece.coords
    const newOptions = [];

    // a king can move in any direction
    // the direction will be set to null if a piece cannot move there (ie - there is a piece in the way or the board finishes)

    if (player === 0 || piece.king) {
        const topRight = coords.x === 7 || coords.y === 0 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x +1 && piece.coords.y === coords.y -1)[0];
        const topLeft = coords.x === 0  || coords.y === 0 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x -1 && piece.coords.y === coords.y -1)[0];

        if (topRight === undefined) {
            newOptions.push({ 
                start: coords, 
                end: { x: coords.x +1, y: coords.y -1 },
                becomeKing: coords.y === 1
            });
        } else if (topRight !== null && topRight.color !== piece.color) {
            // check space behind
            const behindTopRight = coords.x === 6 || coords.y === 1 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x +2 && piece.coords.y === coords.y -2)[0];

            if (behindTopRight === undefined) {
                newOptions.push({ 
                    start: coords, 
                    end: { x: coords.x +2, y: coords.y -2 },
                    kill: topRight,
                    becomeKing: coords.y === 2
                });
            }
        }

        if (topLeft === undefined) {
            newOptions.push({ 
                start: coords, 
                end: { x: coords.x -1, y: coords.y -1 },
                becomeKing: coords.y === 1
            });
        } else if (topLeft !== null && topLeft.color !== piece.color) {
            // check space behind
            const behindTopLeft = coords.x === 1 || coords.y === 1 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x -2 && piece.coords.y === coords.y -2)[0];

            if (behindTopLeft === undefined) {
                newOptions.push({ 
                    start: coords, 
                    end: { x: coords.x -2, y: coords.y -2 }, 
                    kill: topLeft,
                    becomeKing: coords.y === 2
                });
            }
        }
    }

    if (player === 1 || piece.king) {
        const bottomRight = coords.x === 7 || coords.y === 7 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x +1 && piece.coords.y === coords.y +1)[0];
        const bottomLeft = coords.x === 0 || coords.y === 7 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x -1 && piece.coords.y === coords.y +1)[0];

        if (bottomRight === undefined) {
            newOptions.push({ 
                start: coords, 
                end: { x: coords.x +1, y: coords.y +1 } ,
                becomeKing: coords.y === 6
            });
        } else if (bottomRight !== null && bottomRight.color !== piece.color) {
            // check space behind
            const behindBottomRight = coords.x === 6 || coords.y === 6 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x +2 && piece.coords.y === coords.y +2)[0];

            if (behindBottomRight === undefined) {
                newOptions.push({ 
                    start: coords, 
                    end: { x: coords.x +2, y: coords.y +2 },
                    kill: bottomRight,
                    becomeKing: coords.y === 5
                });
            }
        }

        if (bottomLeft === undefined) {
            newOptions.push({ 
                start: coords, 
                end: { x: coords.x -1, y: coords.y +1 },
                becomeKing: coords.y === 6
            });
        } else if (bottomLeft !== null && bottomLeft.color !== piece.color) {
            // check space behind
            const behindBottomLeft = coords.x === 1 || coords.y === 6 ? null : this.state.pieces.filter(piece => piece.coords.x === coords.x -2 && piece.coords.y === coords.y +2)[0];

            if (behindBottomLeft === undefined) {
                newOptions.push({ 
                    start: coords, 
                    end: { x: coords.x -2, y: coords.y +2 }, 
                    kill: bottomLeft,
                    becomeKing: coords.y === 5
                });
            }
        }
    }

    return newOptions;
}

export default generateOptions;