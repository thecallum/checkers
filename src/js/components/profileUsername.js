const successMessage = require('../components/successMessage');
const errorMessage = require('../components/errorMessage');

const usernameAvailable = require('../requests/usernameAvailable');

module.exports = new Vue({
    el: '#app__username',
    components: { successMessage, errorMessage },
    data: {
        username: '',
        baseValue: '',
        updated: false,
        loading: false,
        available: null,
        loadingTimeout: null,
        saving: false,
        successMessage: null,
        errorMessage: null,
    },

    mounted() {
        const username = this.$refs['username'].dataset.value;
        this.username = username;
        this.baseValue = username;
    },

    methods: {
        save() {
            if (this.unchanged || !this.valid || this.available === false) {
                console.log('Error, cannot save username');
                // add rules somewhere
                return;
            }

            this.saving = true;
            this.successMessage = null;
            this.errorMessage = null;

            const body = { username: this.username };

            fetch('/user/update/username', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => {
                    console.log('save user', res.status);

                    if (res.status === 200) {
                        this.baseValue = this.username;
                        this.setSuccess('Username has been updated');
                    } else {
                        console.log('unknown error', res.status);
                        this.setError('Unknown Error. Try again');
                    }
                })
                .catch(e => {
                    console.error('save user error', e);
                    this.setError('Unknown Error. Try again');
                })
                .finally(() => (this.saving = false));
        },

        closeSuccessMessage() {
            this.successMessage = null;
        },

        closeErrorMessage() {
            this.errorMessage = null;
        },

        setError(message) {
            this.successMessage = null;
            this.errorMessage = message;
        },

        setSuccess(message) {
            this.errorMessage = null;
            this.successMessage = message;
        },
    },

    computed: {
        invalid() {
            if (!this.username.match(/^.{2,14}$/) || !this.username.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/)) return true;
            return false;
        },

        valid() {
            return !this.invalid && this.username !== this.baseValue;
        },

        unchanged() {
            return this.username === this.baseValue;
        },

        loadingClass() {
            return {
                loading: (this.loading || this.saving) && !this.unchanged,
            };
        },
    },

    watch: {
        username() {
            if (!this.valid) return;

            this.loading = true;

            if (this.loadingTimeout) clearTimeout(this.loadingTimeout);

            this.loadingTimeout = setTimeout(() => {
                usernameAvailable(this.username)
                    .then(res => {
                        this.available = res;
                        this.loading = false;
                    })
                    .catch(err => {
                        console.log({ err });
                        this.available = null;
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }, 500);
        },

        valid() {
            if (!this.valid) this.loading = false;
        },
    },
});
