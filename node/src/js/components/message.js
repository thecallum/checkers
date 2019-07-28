module.exports = {
    props: {
        close: { type: Function, required: true },
        message: { type: String, required: true },
        type: { type: String, required: true, validator: value => value === 'success' || value === 'error' },
    },

    template: `
    <div v-bind:class="messageClass">
        {{ message }} 
        <button class="message__close" @click="close" type="button">X</button>
    </div>
    `,

    computed: {
        messageClass() {
            return { [`message__${this.type}`]: true };
        },
    },
};
