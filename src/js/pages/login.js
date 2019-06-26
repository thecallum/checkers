const message = require('../components/message');

new Vue({
    el: '#app',
    components: { message },
    data: {
        hasSubmitted: false,
        loading: false,
        requestError: null,

        email: '',
        password: '',
        stayLogged: false,
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();

            if (this.loading) return;

            this.hasSubmitted = true;

            if (!!this.emailError || !!this.passwordError) return;

            this.closeErrorMessage();
            this.loading = true;

            const body = {
                email: this.email,
                password: this.password,
                stayLogged: this.stayLogged,
            };

            fetch('/login', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => {
                    if (res.status === 200) {
                        window.location = '/profile';
                    } else if (res.status === 401) {
                        this.requestError = 'Invalid email or password!';
                    }
                })
                .catch(e => {
                    console.error('Login error', e);
                    this.requestError = 'Unknown error! Please try again';
                })
                .finally(() => (this.loading = false));
        },
        closeErrorMessage() {
            this.requestError = null;
        },
    },

    computed: {
        emailError() {
            if (this.hasSubmitted && this.email === '') return 'Email is required';
            if (this.email === '') return false;
            if (!validator.isEmail(this.email)) return 'Invalid email';
            return false;
        },

        passwordError() {
            if (this.hasSubmitted && this.password === '') return 'Password is required';
            if (this.password === '') return false;
            return false;
        },

        emailClass() {
            return {
                valid: !this.emailError && this.email,
                invalid: !!this.emailError,
            };
        },

        passwordClass() {
            return {
                valid: !this.passwordError && this.password,
                invalid: !!this.passwordError,
            };
        },
    },
});
