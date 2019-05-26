console.log('APP RUNNING');

import canvas from './components/canvas';
import Piece from './components/piece';
import generatePieces from './components/generatePieces';

import modal from './components/modal';

import io from 'socket.io-client';

new Vue({
    el: '#app',
    components: { canvasComponent: canvas, modal },

    data: {
        socket: null,
        connecting: true,
        socketerror: null,

        game: null,
        foundGame: null,
        state: 'connecting',

        accepted: false,
        opponentAccepted: false,

        // =============
        canvas: {
            width: 500,
            maxWidth: 500,
            gridSize: 500 / 8,
            halfGridSize: 500 /16,
        },
        // =============

        update: null,
        preDraw: null,
        canvasElement: null,
    },


    mounted() {

        const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
        this.canvas.width = width;
        this.canvas.gridSize = width / 8;
        this.canvas.halfGridSize = width / 16;

        window.addEventListener('resize', this.handleResize)

        console.log('Connecting to server');
        this.socket = io.connect('/');

        this.socket.on('error', error => {
            this.socketerror = error;
        })

        this.socket.on('connect', () => {
            this.connecting = false;
            this.state = 'connected';
        });

        this.socket.on('disconnect', () => {
            this.connecting = true;
            this.state = 'connecting';
        })

        this.socket.on('game', data => {
            if (!data.hasOwnProperty('state')) return;

            if (data.state === 'queue') {
                this.state = data.state;
                return;
            }

            if (data.state === 'found') {
                this.foundGame = data;
                this.state = data.state;
                return;
            }

            if (data.state === 'accepted') {
                this.opponentAccepted = true;
                return;
            }

            if (data.state === 'ready') {
                this.state = data.state;
                this.game = data.game;

                // start canvas animation

                // this.update({
                //     ...this.game, 
                //     clientUser: 1
                // });

                console.log('READY', data);

                // this.callCanvasRedraw();
                return;
            }

            if (data.state === 'disconnect') {
                alert('Opponent disconnected!');
                this.state = data.state;
                return;
            }
        })
    },

    methods: {
        acceptGame() {
            if (this.accepted) return;
            console.log('game accepted');

            this.accepted = true;
            this.socket.emit('game', {
                state: 'accept',
                data: {
                    gameIndex: this.foundGame.roomIndex
                }
            })
        },
        rejectGame() {
            console.log('Game rejected');
        },
        joinQueue() {
            console.log('Clicked Join Queue');
            this.socket.emit('game', { state: 'join_queue' });
        },

        fetchCanvasControls({ update, preDraw }, canvasElement) {
            console.log('Fetch, called from canvas component');

            // setup game env
            // const newPieces = this.generatePieces();
            // const newOptions = this.generateOptions(newPieces, 0);

            // this.game = {
            //     ...this.game,
            //     pieces: newPieces,
            //     options: newOptions
            // };

            this.update = update;
            this.preDraw = preDraw;
            this.canvasElement = canvasElement;

            // this.preDraw();

            this.callCanvasRedraw();
        },

        callCanvasRedraw() {
            this.update({
                ...this.game, 
                clientUser: 1
            });
        },
        generatePieces: generatePieces,
        handleResize() {
            // 20px for padding
            const width = window.innerWidth > this.canvas.maxWidth ? this.canvas.maxWidth : window.innerWidth - 20;
            this.canvas.width = width;
            this.canvas.gridSize = width / 8;
            this.canvas.halfGridSize = width / 16;


            setTimeout(this.gameStarted ? this.callCanvasRedraw : this.preDraw, 0);

        },

    }
})
