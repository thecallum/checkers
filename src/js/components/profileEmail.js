const successMessage = require('../components/successMessage');
const errorMessage = require('../components/errorMessage');
const { isEmail } = require('validator');

module.exports = new Vue({
    el: '#app__email',
    components: { successMessage, errorMessage },
    data: {
        email: '',
        baseValue: '',
        updated: false,
        loading: false,
        available: true,
        loadingTimeout: null,
        saving: false,
        successMessage: null,
        errorMessage: null,
    },

    mounted() {
        const email = this.$refs['email'].dataset.value;
        this.email = email;
        this.baseValue = email;
    },
    methods: {
        save() {
            if (this.unchanged || !this.valid || this.available === false) return;

            this.saving = true;
            this.successMessage = null;
            this.errorMessage = null;

            const body = { email: this.email };

            fetch('/user/update/email', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => {
                    console.log('save user', res.status);

                    if (res.status === 200) {
                        this.baseValue = this.email;
                        this.setSuccess('Email has been updated!');
                    } else if (res.status === 400) {
                        return res.json();
                    } else {
                        console.log('unknown error', res.status);
                        this.setError('Unknown error. Try again');
                    }
                    return false;
                })
                .then(res => {
                    if (res.hasOwnProperty('message') && res.message === 'Duplicate') {
                        this.setError(`${this.email} isn't available!`);
                    }
                })
                .catch(e => {
                    console.error('save user error', e);
                    this.setError('Unknown error. try again');
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
            return !isEmail(this.email);
        },

        valid() {
            return !this.invalid && this.email !== this.baseValue;
        },

        unchanged() {
            return this.email === this.baseValue;
        },

        loadingClass() {
            return {
                loading: (this.loading || this.saving) && !this.unchanged,
            };
        },
    },

    watch: {
        valid() {
            if (!this.valid) this.loading = false;
        },
    },
});
