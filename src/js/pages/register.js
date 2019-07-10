const usernameAvailable = require('../requests/usernameAvailable');
const passwordRules = require('../components/passwordRules');
const message = require('../components/message');

new Vue({
    el: '#app',
    components: { passwordRules, message },
    data: {
        hasSubmitted: false,
        loading: false,
        mainError: null,

        email: '',
        emailConf: '',
        username: '',
        password: '',
        passwordConf: '',
        stayLogged: false,

        usernameSearchLoading: false,
        usernameTimeout: null,
        usernameSearchValid: undefined,
        usernameSearchRequestError: null,

        passwordRulesActive: false,
    },

    methods: {
        handleSubmit(e) {
            e.preventDefault();

            if (this.loading || this.usernameSearchLoading) return;
            this.closeErrorMessage();
            this.hasSubmitted = true;

            if (
                this.emailError ||
                this.emailConfError ||
                this.usernameError ||
                this.passwordError ||
                this.passwordConfError ||
                this.usernameSearchError ||
                !this.validPassword
            ) {
                const newError = 'You have errors';
                if (!this.validPassword) this.togglePasswordRules(true);
                if (this.mainError !== newError) this.mainError = newError;
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
                    if (res.status === 200) {
                        window.location = '/profile';
                    } else if (res.status === 400) {
                        return res.json();
                    } else {
                        this.mainError = res.status;
                        return false;
                    }
                })
                .then(res => {
                    if (res) this.mainError = res.message;
                })
                .catch(e => {
                    console.error('Login error', e);
                    this.mainError = 'Unknown error! Please try again';
                })
                .finally(() => (this.loading = false));
        },

        togglePasswordRules(state) {
            this.passwordRulesActive = typeof state === 'boolean' ? state : !this.passwordRulesActive;
        },
        closeErrorMessage() {
            this.mainError = null;
        },
    },
    computed: {
        emailError() {
            const el = this.email;
            if (this.hasSubmitted && el === '') return 'Email is required';
            if (el === '') return false;
            if (!validator.isEmail(el)) return 'Invalid email';
            return false;
        },
        emailConfError() {
            const el = this.emailConf;
            if (this.hasSubmitted && el === '') return 'Email is required';
            if (el === '') return false;
            if (!validator.isEmail(el)) return 'Invalid email';
            if (this.email !== el) return "Email doesn't match";
            return false;
        },
        passwordError() {
            const el = this.password;
            if (this.hasSubmitted && el === '') return 'Password is required';
            if (el === '') return false;
            if (!this.validPassword) return "Password doesn't meet rules";
            // check password policy
            return false;
        },
        passwordConfError() {
            const el = this.passwordConf;
            if (this.hasSubmitted && el === '') return 'Password is required';
            if (el === '') return false;
            if (el !== this.password) return "Password doesn't match";
            // check password policy
            return false;
        },
        usernameError() {
            const el = this.username;
            if (this.hasSubmitted && el === '') return 'Username is required';
            if (el === '') return false;

            if (!this.usernameRules[0] || !this.usernameRules[1]) return 'Invalid username';

            return false;
        },
        usernameSearchError() {
            if (this.usernameSearchRequestError) return this.usernameSearchRequestError;

            if (this.usernameSearchValid === false) return `${this.username} is taken`;

            return false;
        },

        email__class() {
            return {
                valid: !this.emailError && this.email,
                invalid: !!this.emailError,
            };
        },
        email__conf__class() {
            return {
                valid: !this.emailConfError && this.emailConf,
                invalid: !!this.emailConfError,
            };
        },
        password__class() {
            return {
                valid: !this.passwordError && this.password,
                invalid: !!this.passwordError,
            };
        },
        password__conf__class() {
            return {
                valid: !this.passwordConfError && this.passwordConf,
                invalid: !!this.passwordConfError,
            };
        },
        username__class() {
            return {
                valid: !this.usernameError && this.username,
                invalid: !!this.usernameError || this.usernameSearchValid === false || this.usernameSearchError,
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
            if (this.usernameError || !this.username) {
                clearTimeout(this.usernameTimeout);
                this.usernameSearchValid = undefined;
                this.usernameSearchLoading = false;
                return;
            }

            this.usernameSearchLoading = true;
            // If user types, reset timeout
            clearTimeout(this.usernameTimeout);

            this.usernameTimeout = setTimeout(() => {
                usernameAvailable(this.username)
                    .then(res => {
                        this.usernameSearchValid = res;
                        this.usernameSearchRequestError = null;
                    })
                    .catch(err => {
                        console.log('Fetch username err', err);
                        this.usernameSearchRequestError = 'Cannot connect to server';
                    })
                    .finally(() => (this.usernameSearchLoading = false));
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
