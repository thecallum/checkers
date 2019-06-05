module.exports = (pieces, currentPlayer, players) => {
    const newOptions = {};


    for (let piece of pieces) {
        newOptions[piece.id] = [];
        if (piece.player !== currentPlayer) continue;

        const coords = piece.coords;


        // a king can move in any direction
        // the direction will be set to null if a piece cannot move there (the board finishes)
        // not undefined means there is a piece is the way

        // 1. if undefined, space is empty (piece can move there)
        // 2. else, if square !null (square exists on board), check if piece is enemy
        // 3. If piece is enemy, check if square behind is empty (so piece can jump/kill enemy)

        if (piece.player === players[0] || piece.king) {
            const topRight = coords.x === 7 || coords.y === 0 ? null : pieces.filter(piece => piece.coords.x === coords.x + 1 && piece.coords.y === coords.y - 1)[0];
            const topLeft = coords.x === 0 || coords.y === 0 ? null : pieces.filter(piece => piece.coords.x === coords.x - 1 && piece.coords.y === coords.y - 1)[0];

            if (topRight === undefined) {
                newOptions[piece.id].push({
                    start: coords,
                    end: { x: coords.x + 1, y: coords.y - 1 },
                    becomeKing: coords.y === 1
                });
            } else if (topRight !== null && topRight.player !== piece.player) {
                const behindTopRight = coords.x === 6 || coords.y === 1 ? null : pieces.filter(piece => piece.coords.x === coords.x + 2 && piece.coords.y === coords.y - 2)[0];

                if (behindTopRight === undefined) {
                    newOptions[piece.id].push({
                        start: coords,
                        end: { x: coords.x + 2, y: coords.y - 2 },
                        kill: topRight,
                        becomeKing: coords.y === 2
                    });
                }
            }

            if (topLeft === undefined) {
                newOptions[piece.id].push({
                    start: coords,
                    end: { x: coords.x - 1, y: coords.y - 1 },
                    becomeKing: coords.y === 1
                });
            } else if (topLeft !== null && topLeft.player !== piece.player) {
                const behindTopLeft = coords.x === 1 || coords.y === 1 ? null : pieces.filter(piece => piece.coords.x === coords.x - 2 && piece.coords.y === coords.y - 2)[0];

                if (behindTopLeft === undefined) {
                    newOptions[piece.id].push({
                        start: coords,
                        end: { x: coords.x - 2, y: coords.y - 2 },
                        kill: topLeft,
                        becomeKing: coords.y === 2
                    });
                }
            }
        }

        if (piece.player === players[1] || piece.king) {
            const bottomRight = coords.x === 7 || coords.y === 7 ? null : pieces.filter(piece => piece.coords.x === coords.x + 1 && piece.coords.y === coords.y + 1)[0];
            const bottomLeft = coords.x === 0 || coords.y === 7 ? null : pieces.filter(piece => piece.coords.x === coords.x - 1 && piece.coords.y === coords.y + 1)[0];

            if (bottomRight === undefined) {
                newOptions[piece.id].push({
                    start: coords,
                    end: { x: coords.x + 1, y: coords.y + 1 },
                    becomeKing: coords.y === 6
                });
            } else if (bottomRight !== null && bottomRight.player !== piece.player) {
                const behindBottomRight = coords.x === 6 || coords.y === 6 ? null : pieces.filter(piece => piece.coords.x === coords.x + 2 && piece.coords.y === coords.y + 2)[0];

                if (behindBottomRight === undefined) {
                    newOptions[piece.id].push({
                        start: coords,
                        end: { x: coords.x + 2, y: coords.y + 2 },
                        kill: bottomRight,
                        becomeKing: coords.y === 5
                    });
                }
            }

            if (bottomLeft === undefined) {
                newOptions[piece.id].push({
                    start: coords,
                    end: { x: coords.x - 1, y: coords.y + 1 },
                    becomeKing: coords.y === 6
                });
            } else if (bottomLeft !== null && bottomLeft.player !== piece.player) {
                const behindBottomLeft = coords.x === 1 || coords.y === 6 ? null : pieces.filter(piece => piece.coords.x === coords.x - 2 && piece.coords.y === coords.y + 2)[0];

                if (behindBottomLeft === undefined) {
                    newOptions[piece.id].push({
                        start: coords,
                        end: { x: coords.x - 2, y: coords.y + 2 },
                        kill: bottomLeft,
                        becomeKing: coords.y === 5
                    });
                }
            }
        }

    }

    return newOptions;
}