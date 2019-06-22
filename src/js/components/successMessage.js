const successMessage = {
    props: {
        close: { type: Function, required: true },
        message: { type: String, required: true },
    },

    template: `
    <div class="profile__success">
        {{ message }} 
        <button class="profile__close" @click="close">X</button>
    </div>
    `,
};

module.exports = successMessage;
