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

            if (!email || !password) return this.error = 'Missing fields!';
            
            // Error flashes for each request
            // this.error = null;

            const body = { email, password };

            fetch('/login', {
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