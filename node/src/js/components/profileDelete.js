const message = require('../components/message');
const modal = require('./modal');

module.exports = new Vue({
    el: '#app__delete',
    components: { message, modal },
    data: {
        password: '',
        loading: false,
        errorMessage: null,
        showModal: false,
    },

    methods: {
        toggleModal() {
            this.showModal = true;
        },

        cancel() {
            this.showModal = false;
            this.email = '';
        },

        deletePassword() {
            this.showModal = true;
        },

        confirmDelete() {
            if (this.password === '') return;

            this.loading = true;
            this.errorMessage = null;

            fetch('/user/update/delete-account', {
                method: 'POST',
                body: JSON.stringify({ password: this.password }),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => {
                    if (res.status === 200) {
                        window.location = '/';
                    } else if (res.status === 401) {
                        this.errorMessage = 'Invalid password';
                    } else {
                        this.errorMessage = 'Unknown Error';
                    }
                })
                .catch(() => {
                    this.errorMessage = 'Unknown Error';
                })
                .finally(() => {
                    this.showModal = false;
                    this.loading = false;
                });
        },

        closeErrorMessage() {
            this.errorMessage = null;
        },
    },

    computed: {
        validEmail() {
            return this.email === this.actualEmail;
        },
    },
});
