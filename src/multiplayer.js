console.log('APP RUNNING');

const canvas = {
    props: {
        fetchcanvascontrols: { type: Function, required: true }
    },
    data: function() {
        return {
            width: 500,
            maxWidth: 500,



            gamestate: {}, // passed in when game is to be updated
            
            canvas: null,
            ctx: null,




        }
    },
    mounted() {
        window.onresize = () => this.handleResize();

        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');

        // load font

        // controlls passed back to app to rerender the canvas
        const controls = {
            update: this.update,
            preDraw: this.preDraw
        }

        this.fetchcanvascontrols(controls);
    },
    methods: {
        handleResize() {
            this.width = this.maxWidth > window.innerWidth ? window.innerWidth : this.maxWidth;
        },
        update() {
            console.log('update canvas');

            const xRand = Math.floor(Math.random() * (this.width - 20));
            const yRand = Math.floor(Math.random() * (this.width - 20));
            
            const colors = [
                'red',
                'green',
                'blue',
                'orange',
                'purple',
                'cyan',
                'yellow',
                'black',
                'white'
            ];

            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

            this.ctx.fillRect(xRand, yRand, 20, 20);

        },
        preDraw() {
            console.log('preDraw');
        }
    },
    template: (`
        <canvas 
            id='canvas' 
            class='canvas'
            v-bind:width='this.width' 
            v-bind:height='this.width'
            ref='canvas'
        >

        </canvas>
    `),
}

new Vue({
    el: '#app',
    components: { canvasComponent: canvas },
    data: {
        players: [
            { name: 'Player 1', src: '#' },
            { name: 'Player 2', src: '#' }
        ],

        activePlayer: 0,


        update: null,
        preDraw: null,


    },

    methods: {
        fetchCanvasControls({ update, preDraw }) {
            console.log('Fetch, called from canvas component');


            this.update = update;
            this.preDraw = preDraw;

            setInterval(() => {
                this.update();
            }, 10);
        }
     }
})