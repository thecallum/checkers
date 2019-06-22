const errorMessage = {
    props: {
        close: { type: Function, required: true },
        message: { type: String, required: true },
    },

    template: `
    <div class="profile__error">
        {{ message }} 
        <button class="profile__close" @click="close">X</button>
    </div>
    `,
};

module.exports = errorMessage;
