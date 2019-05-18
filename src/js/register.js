new Vue({
    el: '#app',
    data: {
        error: null
    },
    methods: {
        handleSubmit(e) {
            e.preventDefault();

            const email = e.target.email.value;
            const password = e.target.password.value;
            const username = e.target.username.value;
            const stayLogged = e.target.staylogged.checked;

            if (!email || !password || !username) return this.error = 'Missing fields!';

            // Error flashes for each request
            // this.error = null;

            const body = { email, password, username, stayLogged };

            fetch('/register', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" }
            })
                .then(res => {
                    if (res.status === 200) {
                        window.location = '/profile';
                    } else {
                        this.error = res.status;
                    }
                })
                .catch(e => {
                    console.error('Login error', e)
                    this.error = 'Fetch error!';
                });
        }
    }
})