// import validator from 'validator';

new Vue({
    el: "#app",
    data: {
        hasSubmitted: false,
        loading: false,
        request__error: null,

        email: "",
        password: "",
        stayLogged: false

    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();

            if (this.loading) return;

            console.log("Handle Submit");
            this.hasSubmitted = true;

            if (!!this.email__error && this.password__error) return;

            this.loading = true;

            const body = { email: this.email, password: this.password, stayLogged: this.stayLogged };

            fetch('/login', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" }
            })
            .then(res => {
                this.loading = false;
                if (res.status === 200) {
                    window.location = '/profile';
                } else {
                    this.request__error = res.status;
                }
            })
            .catch(e => {
                console.error('Login error', e)
                this.request__error = 'Fetch error!'; 
                this.loading = false; 
            });

        }
    },

    computed: {
        email__error() {
            if (this.hasSubmitted && this.email === "") {
                return "Email is required";
            } else if (this.email === "") {
                return false;
            }

            if (!validator.isEmail(this.email)) {
                return "Invalid email";
            }

            return false;
        },
        password__error: {
            get() {
                if (this.hasSubmitted && this.password === "") {
                    return "Password is required";
                } else if (this.password === "") {
                    return false;
                }

                // We don't need to tell the user too much about the password policy
                return false;
            }

        },

        email__class() {
            return {
                valid: !this.email__error && this.email,
                invalid: !!this.email__error
            }
        },
        password__class() {
            return {
                valid: !this.password__error && this.password,
                invalid: !!this.password__error
            }
        }
    }
});

//
