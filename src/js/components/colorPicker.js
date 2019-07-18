const colors = require('../game_modules/colors');

module.exports = {
    props: {
        updateColor: { type: Function, required: true },
    },

    data() {
        return {
            colors: colors.colors,

            selected: Math.floor(Math.random() * 8),
        };
    },

    methods: {
        toggleColor(e) {
            this.selected = e.target.dataset.value;
            this.callUpdateColor();
        },

        callUpdateColor() {
            this.updateColor(this.selected);
        },
    },

    mounted() {
        this.callUpdateColor();
    },

    template: `
        <div class="colorpicker">
            <h4 class="colorpicker__title">Select A Color</h4>
            <div class="colorpicker__container">
                <div 
                    class="colorpicker__color" 
                    v-for="(color, index) in colors" 
                    :style="{ backgroundColor: color.primary }"
                    :class="{ active: selected == index }"
                    @click="toggleColor"
                    :data-value="index"
                ></div>
             
            </div>
        </div>
    `,
};
