const generatePieces = require('../src/js/components/generatePieces');
const generateOptions = require('../src/js/components/generateOptions');
const updatePieces = require('../src/js/components/updatePieces');
const nextPlayer = require('../src/js/components/nextPlayer');

const setupGames = () => {
    const games = {};

    const create = (id, players, currentPlayerID) => {

        const newPieces = generatePieces(players[0], players[1]);
        const newOptions = generateOptions(newPieces, players[0], players);

        const game = {
            pieces: newPieces,
            options: newOptions,
            players,
            currentPlayer: currentPlayerID
        }

        games[id] = game;
        return game;
    }


    const getCurrentPlayer = id => {
        return games[id].currentPlayer
    }

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
    }

    const submitTurn = (id, userID, { selectedOption, selectedPiece: selectedOptionID }) => {
        const game = games[id];

        if (userID !== game.currentPlayer) return null;

        if (game.won) return null; // game already won, cannot make another move

        const gameOptions = game.options[selectedOptionID];

        if (gameOptions.length === 0) return; // there must be options

        let validOption = false;

        for (let option of gameOptions) {
            if (JSON.stringify(option) === JSON.stringify(selectedOption)) {
                validOption = true;
                break;
            }
        }

        if (!validOption) return null;


        const newPieces = updatePieces(selectedOption, selectedOptionID, game.pieces, game.currentPlayer);
        const newPlayer = nextPlayer(game.currentPlayer, game.players);
        const newOptions = generateOptions(newPieces, newPlayer, game.players);

        const gameWon = checkWin(newPieces, newPlayer, newOptions);

        games[id] = {
            ...game,
            pieces: newPieces,
            options: newOptions,
            selectedPiece: null,
            currentPlayer: newPlayer,
            won: !!gameWon
        };

        const updatedGame = games[id];

        return { updatedGame, gameWon }
    }

    const close = id => delete games[id];

    return { games, create, getCurrentPlayer, submitTurn, close };
}

module.exports = setupGames;