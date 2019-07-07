const generatePieces = require('../src/js/game_modules/generatePieces');
const generateOptions = require('../src/js/game_modules/generateOptions');
const updatePieces = require('../src/js/game_modules/updatePieces');
const nextPlayer = require('../src/js/game_modules/nextPlayer');
const colors = require('../src/js/game_modules/colors');

const Games = () => {
    const games = {};

    const create = (id, players) => {
        const randomNumber = Math.floor(Math.random() * 2);

        const startPlayer = players[randomNumber];
        const otherPlayer = players[randomNumber === 0 ? 1 : 0];

        const gamePlayers = [{ id: startPlayer, color: colors.red }, { id: otherPlayer, color: colors.blue }];

        const newPieces = generatePieces(gamePlayers[0].id, gamePlayers[1].id);
        const newOptions = generateOptions(newPieces, gamePlayers[0].id, gamePlayers);

        const game = {
            pieces: newPieces,
            options: newOptions,
            players: gamePlayers,
            currentPlayer: startPlayer,
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

    const update = (gameID, { selectedOption, selectedPiece }) => {
        const game = games[gameID];
        const newPlayer = nextPlayer(game.currentPlayer, game.players);
        const newPieces = updatePieces(selectedOption, selectedPiece, game.pieces, game.currentPlayer);
        const newOptions = generateOptions(newPieces, newPlayer, game.players);
        const gameWon = checkWin(newPieces, newPlayer, newOptions);

        const newGame = {
            ...game,
            pieces: newPieces,
            options: newOptions,
            currentPlayer: newPlayer,
            won: gameWon,
        };

        games[gameID] = newGame;
        return newGame;
    };

    const isPlayersTurn = (roomID, userID) => games[roomID].currentPlayer === userID;

    const isValidMove = (roomID, move) => {
        try {
            if (!move.hasOwnProperty('selectedOption')) return false;
            if (!move.selectedOption.hasOwnProperty('start')) return false;

            if (!move.selectedOption.start.hasOwnProperty('x')) return false;
            if (!Number.isInteger(move.selectedOption.start.x) || move.selectedOption.start.x < 0 || move.selectedOption.start.x > 7) return false;

            if (!move.selectedOption.start.hasOwnProperty('y')) return false;
            if (!Number.isInteger(move.selectedOption.start.y) || move.selectedOption.start.y < 0 || move.selectedOption.start.y > 7) return false;

            if (!move.selectedOption.end.hasOwnProperty('x')) return false;
            if (!Number.isInteger(move.selectedOption.end.x) || move.selectedOption.end.x < 0 || move.selectedOption.end.x > 7) return false;

            if (!move.selectedOption.end.hasOwnProperty('y')) return false;
            if (!Number.isInteger(move.selectedOption.end.y) || move.selectedOption.end.y < 0 || move.selectedOption.end.y > 7) return false;

            if (move.selectedOption.hasOwnProperty('becomeKing')) {
                if (typeof move.selectedOption.becomeKing !== 'boolean') return false;
            }

            if (!move.hasOwnProperty('selectedPiece')) return false;
            if (!Number.isInteger(move.selectedPiece) || move.selectedPiece < 0 || move.selectedPiece > 23) return false;
        } catch (e) {
            return false;
        }

        // move is correctly formatted
        // now verify that move matches one of the options

        const gameOptions = games[roomID].options[move.selectedPiece];

        let validOption = false;

        for (let option of gameOptions) {
            if (JSON.stringify(option) === JSON.stringify(move.selectedOption)) {
                validOption = true;
                break;
            }
        }

        return validOption;
    };

    const close = id => delete games[id];

    const exists = id => !!games.hasOwnProperty(id);

    return { create, getCurrentPlayer, update, close, exists, isPlayersTurn, isValidMove };
};

module.exports = Games;
