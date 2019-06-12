const generatePieces = require('../src/js/components/generatePieces');
const generateOptions = require('../src/js/components/generateOptions');
const updatePieces = require('../src/js/components/updatePieces');
const nextPlayer = require('../src/js/components/nextPlayer');

const setupGames = () => {
    const games = {};

    const create = (id, players, currentPlayerID) => {
        const newPieces_0 = generatePieces(players[0], players[1], 0);
        const newOptions_0 = generateOptions(newPieces_0, players[0], players);

        const newPieces_1 = generatePieces(players[1], players[0], 1);
        const newOptions_1 = generateOptions(newPieces_1, players[1], players);

        const game = {
            // pieces: newPieces,
            // options: newOptions,
            players,
            currentPlayer: currentPlayerID,

            [players[0]]: {
                pieces: newPieces_0,
                options: newOptions_0,

            },
            [players[1]]: {
                pieces: newPieces_1,
                options: newOptions_1,

            }
        };

        games[id] = game;
        return game;
    };

    const getCurrentPlayer = id => games[id].currentPlayer;

    const checkWin = (newPieces, newPlayer, newOptions) => {
        const opponentHasPieces = newPieces.filter(piece => piece.player === newPlayer).length > 0;
        if (!opponentHasPieces) return 'win';

        let opponentHasOptions = false;
        for (let option of Object.keys(newOptions)) {
            const currentOption = newOptions[option];

            if (currentOption.length > 0) {
                opponentHasOptions = true;
                break;
            }
        }

        if (!opponentHasOptions) return 'draw';
        return false;
    };

    const updateGame = (game, selectedOption, selectedOptionID) => {
        console.log('UPDATE GAME', game);

        console.log('SELECTED OOTION', selectedOption, selectedOptionID)

        const newPlayer = nextPlayer(game.currentPlayer, game.players);

        const newPieces_0 = updatePieces(selectedOption, selectedOptionID, game[game.players[0]].pieces, game.currentPlayer);
        const newOptions_0 = generateOptions(newPieces_0, newPlayer, game.players);

        const newPieces_1 = updatePieces(selectedOption, selectedOptionID, game[game.players[1]].pieces, game.currentPlayer);
        const newOptions_1 = generateOptions(newPieces_1, newPlayer, game.players);

        const gameWon = checkWin(newPieces_0, newPlayer, newOptions_0);

        return {
            ...game,

            [game.players[0]]: {
                options: newOptions_0,
                pieces: newPieces_0,
            },

            [game.players[1]]: {
                options: newOptions_1,
                pieces: newPieces_1,
            },

            // pieces: newPieces,
            // options: newOptions,
            currentPlayer: newPlayer,
            won: !!gameWon,
        };
    };

    const submitTurn = (id, userID, {
        selectedOption,
        selectedPiece: selectedOptionID
    }) => {
        const game = games[id];
        // check that correct player made the mode
        if (userID !== game.currentPlayer) return null;
        // game already won, cannot make another move
        if (game.won) return null;

        const gameOptions = game[userID].options[selectedOptionID];
        // there must be options
        if (gameOptions.length === 0) return;

        let validOption = false;

        for (let option of gameOptions) {
            if (JSON.stringify(option) === JSON.stringify(selectedOption)) {
                validOption = true;
                break;
            }
        }

        if (!validOption) return null;
        const updatedGame = updateGame(game, selectedOption, selectedOptionID);
        games[id] = updatedGame;
        return updatedGame;
    };

    const close = id => delete games[id];

    const exists = id => !!games.hasOwnProperty(id);

    return {
        create,
        getCurrentPlayer,
        submitTurn,
        close,
        exists
    };
};

module.exports = setupGames;