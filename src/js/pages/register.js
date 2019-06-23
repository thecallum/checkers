const usernameAvailable = require('../requests/usernameAvailable');
const passwordRules = require('../components/passwordRules');

new Vue({
    el: '#app',
    components: { passwordRules },
    data: {
        hasSubmitted: false,
        loading: false,
        main__error: null,

        email: '',
        email__conf: '',
        username: '',
        password: '',
        password__conf: '',
        stayLogged: false,

        username_search_loading: false,
        username_timeout: null,
        username_search_valid: undefined,
        username__search__request__error: null,

        passwordRulesActive: false,
    },

    methods: {
        handleSubmit(e) {
            e.preventDefault();

            if (this.loading || this.username_search_loading) return;

            this.main__error = null;

            this.hasSubmitted = true;

            if (
                this.email__error ||
                this.email__conf__error ||
                this.username__error ||
                this.password__error ||
                this.password__conf__error ||
                this.username__search__error ||
                !this.validPassword
            ) {
                const newError = 'You have errors';
                if (!this.validPassword) this.togglePasswordRules(true);
                if (this.main__error !== newError) this.main__error = newError;
                return;
            }

            this.loading = true;

            const body = {
                email: this.email,
                password: this.password,
                username: this.username,
                stayLogged: this.stayLogged,
            };

            fetch('/register', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => {
                    this.loading = false;
                    if (res.status === 200) {
                        window.location = '/profile';
                    } else if (res.status === 400) {
                        res.json().then(res => (this.main__error = res.message));
                    } else {
                        this.main__error = res.status;
                    }
                })
                .catch(e => {
                    console.error('Login error', e);
                    this.request__error = 'Unknown error! Please try again';
                    this.main__error = false;
                });
        },

        togglePasswordRules(state) {
            this.passwordRulesActive = typeof state === 'boolean' ? state : !this.passwordRulesActive;
        },
    },
    computed: {
        email__error() {
            const el = this.email;
            if (this.hasSubmitted && el === '') return 'Email is required';
            if (el === '') return false;
            if (!validator.isEmail(el)) return 'Invalid email';
            return false;
        },
        email__conf__error() {
            const el = this.email__conf;
            if (this.hasSubmitted && el === '') return 'Email is required';
            if (el === '') return false;
            if (!validator.isEmail(el)) return 'Invalid email';
            if (this.email !== el) return "Email doesn't match";
            return false;
        },
        password__error() {
            const el = this.password;
            if (this.hasSubmitted && el === '') return 'Password is required';
            if (el === '') return false;
            // check password policy
            return false;
        },
        password__conf__error() {
            const el = this.password__conf;
            if (this.hasSubmitted && el === '') return 'Password is required';
            if (el === '') return false;
            if (el !== this.password) return "Password doesn't match";
            // check password policy
            return false;
        },
        username__error() {
            const el = this.username;
            if (this.hasSubmitted && el === '') return 'Username is required';
            if (el === '') return false;
            // if (el.length < 10) return "Username must be 10 characters"

            if (!this.usernameRules[0] || !this.usernameRules[1]) return 'Invalid username';

            return false;
        },
        username__search__error() {
            if (this.username__search__request__error) return this.username__search__request__error;

            if (this.username_search_valid === false) return `${this.username} is taken`;

            // validate username
            // check username is available

            return false;
        },

        email__class() {
            return {
                valid: !this.email__error && this.email,
                invalid: !!this.email__error,
            };
        },
        email__conf__class() {
            return {
                valid: !this.email__conf__error && this.email__conf,
                invalid: !!this.email__conf__error,
            };
        },
        password__class() {
            return {
                valid: !this.password__error && this.password,
                invalid: !!this.password__error,
            };
        },
        password__conf__class() {
            return {
                valid: !this.password__conf__error && this.password__conf,
                invalid: !!this.password__conf__error,
            };
        },
        username__class() {
            return {
                valid: !this.username__error && this.username,
                invalid: !!this.username__error || this.username_search_valid === false || this.username__search__error,
            };
        },

        passwordRules() {
            return [
                // value: 'Between 10-128 characters',
                !!this.password.match(/^.{10,128}$/),
                // value: 'No more than 2 identical characters in a row (e.g. 111 not allowed)',
                !this.password.match(/(.)\1{2,}/),
                // value: 'At least 1 uppercase character (A-Z)',
                !!this.password.match(/[A-Z]/),
                // value: 'At least 1 lowercase character (a-z)',
                !!this.password.match(/[a-z]/),
                // value: 'At least 1 digit (0-9)',
                !!this.password.match(/[0-9]/),
                // value: 'At least 1 special character (punctuation and space count as special characters)',
                !!this.password.match(/[!@#$%^&*(),.?":{}|<> ]/),
            ];
        },

        validPassword() {
            if (!this.passwordRules[0] || !this.passwordRules[1]) return false;

            let count = 0;

            if (this.passwordRules[2]) count++;
            if (this.passwordRules[3]) count++;
            if (this.passwordRules[4]) count++;
            if (this.passwordRules[5]) count++;

            return count >= 3;
        },

        usernameRules() {
            return [
                // value: 'Between 2-14 characters',
                !!this.username.match(/^.{2,14}$/),
                // value: 'Allow letters, numbers and punctuation',
                !!this.username.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/),
            ];
        },
    },
    watch: {
        username() {
            if (this.username__error || !this.username) {
                clearTimeout(this.username_timeout);
                this.username_search_valid = undefined;
                this.username_search_loading = false;
                return;
            }

            this.username_search_loading = true;
            // If user types, reset timeout
            clearTimeout(this.username_timeout);

            this.username_timeout = setTimeout(() => {
                usernameAvailable(this.username)
                    .then(res => {
                        this.username_search_valid = res;
                        this.username__search__request__error = null;
                        this.username_search_loading = false;
                    })
                    .catch(err => {
                        console.log('Fetch username err', err);

                        this.username_search_loading = false;
                        this.username__search__request__error = 'Cannot connect to server';
                    });
            }, 500);

            // on change, set loading to true
            // wait 200ms for user to stop typing ==> send request
            // if user types, still display previous request
            // stop loading on response

            // if loading -- display loading
            // if undefined -- display nothing
            // if valid -- display tick
            // if invalid -- display cross ( username already taken )
        },
    },
});
