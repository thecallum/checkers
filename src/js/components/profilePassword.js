const message = require('../components/message');
const passwordRules = require('../components/passwordRules');

module.exports = new Vue({
    el: '#app__password',
    components: { message, passwordRules },
    data: {
        passwordCurrent: '',
        passwordNew: '',
        passwordNewConf: '',

        loadingTimeout: null,
        saving: false,
        successMessage: null,
        errorMessage: null,

        passwordRulesActive: false,
    },

    methods: {
        save() {
            if (!this.validPassword || !this.passwordsMatch || this.saving || this.empty) return;

            const body = {
                currentPassword: this.passwordCurrent,
                newPassword: this.passwordNew,
            };

            this.saving = true;
            this.successMessage = null;
            this.errorMessage = null;

            fetch('/user/update/password', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => {
                    if (res.status === 200) {
                        this.passwordCurrent = '';
                        this.passwordNew = '';
                        this.passwordNewConf = '';
                        this.setSuccess('Password was updated');
                    } else if (res.status === 401) {
                        this.setError('The password was incorect');
                    } else {
                        this.setError('Error: ' + res.status);
                    }
                })
                .catch(() => this.setError('Some error'))
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

        togglePasswordRules(state) {
            this.passwordRulesActive = typeof state === 'boolean' ? state : !this.passwordRulesActive;
        },
    },

    computed: {
        emptyCurrent() {
            return this.passwordCurrent === '';
        },
        emptyNew() {
            return this.passwordNew === '' && this.passwordNewConf === '';
        },
        empty() {
            return this.emptyCurrent || this.emptyNew;
        },
        invalid() {
            if (!this.validPassword) return true;
            if (!this.passwordsMatch) return true;
            return false;
        },

        passwordsMatch() {
            return this.passwordNew === this.passwordNewConf;
        },

        loadingClass() {
            return { loading: this.loading };
        },

        passwordRules() {
            return [
                // value: 'Between 10-128 characters',
                !!this.passwordNew.match(/^.{10,128}$/),
                // value: 'No more than 2 identical characters in a row (e.g. 111 not allowed)',
                !this.passwordNew.match(/(.)\1{2,}/),
                // value: 'At least 1 uppercase character (A-Z)',
                !!this.passwordNew.match(/[A-Z]/),
                // value: 'At least 1 lowercase character (a-z)',
                !!this.passwordNew.match(/[a-z]/),
                // value: 'At least 1 digit (0-9)',
                !!this.passwordNew.match(/[0-9]/),
                // value: 'At least 1 special character (punctuation and space count as special characters)',
                !!this.passwordNew.match(/[!@#$%^&*(),.?":{}|<> ]/),
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
    },
});
