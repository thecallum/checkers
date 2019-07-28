module.exports = {
    props: {
        show: { type: Boolean, required: true },
    },

    template: `
        <div class='modal' v-bind:class="{ 'modal__show': show }">
            <div class="modal__background"></div>

            <div class="modal__body">
                <slot></slot>
            </div>
        </div>
    `,
};
