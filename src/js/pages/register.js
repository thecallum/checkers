new Vue({
	el: '#app',
	data: {
		hasSubmitted: false,
		loading: false,
		main__error: null,

		// controlled inputs =============
		email: '',
		email__conf: '',
		username: '',
		password: '',
		password__conf: '',
		stayLogged: false,
		// ================================

		password_rules: [
			{
				// value: 'Between 10-128 characters',
				test: str => str.match(/^.{10,128}$/),
			},
			{
				// value: 'No more than 2 identical characters in a row (e.g. 111 not allowed)',
				test: str => !str.match(/(.)\1{2,}/),
			},
			{
				// value: 'At least 1 uppercase character (A-Z)',
				test: str => str.match(/[A-Z]/),
			},
			{
				// value: 'At least 1 lowercase character (a-z)',
				test: str => str.match(/[a-z]/),
			},
			{
				// value: 'At least 1 digit (0-9)',
				test: str => str.match(/[0-9]/),
			},
			{
				// value: 'At least 1 special character (punctuation and space count as special characters)',
				test: str => str.match(/[!@#$%^&*(),.?":{}|<> ]/),
			},
		],

		username__rules: [
			{
				// value: 'Between 2-14 characters',
				test: str => str.match(/^.{2,14}$/),
				// test: str => true,
			},
			{
				// value: 'Allow letters, numbers and punctuation',
				test: str => str.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/),
				// test: str => true,
			},
		],

		username_search_loading: false,
		username_timeout: null,
		username_search_valid: undefined,
	},
	mounted() {
		console.log('Vue mounted');
		// window.onbeforeunload = () => '';
	},
	methods: {
		handleSubmit(e) {
			e.preventDefault();

			if (this.loading || this.username_search_loading) return;

			this.main__error = null;

			console.log('Handle Submit');
			this.hasSubmitted = true;

			if (
				this.email__error ||
				this.email__conf__error ||
				this.username__error ||
				this.password__error ||
				this.password__conf__error ||
				this.username__search__error ||
				!this.rule_0_met ||
				!this.rule_1_met ||
				!this.rule_3_of_4_met
			) {
				const newError = 'You have errors';

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
						//  check for message

						res.json()
							.then(res => {
								// console.log('404 res', res);
								this.main__error = res.message;
							})
							.catch(() => {
								// console.log('error parsing', e)
								this.main__error = res.status;
							});
					} else {
						this.main__error = res.status;
					}
				})
				.catch(e => {
					console.error('Login error', e);
					this.error = 'Fetch error!';
					this.main__error = false;
				});
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

			if (!this.username_rule_0_met || !this.username_rule_1_met) return 'Invalid username';

			return false;
		},
		username__search__error() {
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
				invalid: !!this.username__error || this.username_search_valid === false,
			};
		},

		rule_0_met() {
			return !!this.password_rules[0].test(this.password);
		},
		rule_1_met() {
			return !!this.password_rules[1].test(this.password);
		},
		rule_2_met() {
			return !!this.password_rules[2].test(this.password);
		},
		rule_3_met() {
			return !!this.password_rules[3].test(this.password);
		},
		rule_4_met() {
			return !!this.password_rules[4].test(this.password);
		},
		rule_5_met() {
			return !!this.password_rules[5].test(this.password);
		},
		rule_3_of_4_met() {
			let count = 0;

			if (this.rule_2_met) count++;
			if (this.rule_3_met) count++;
			if (this.rule_4_met) count++;
			if (this.rule_5_met) count++;

			return count >= 3;
		},

		// rules
		rule_0_class() {
			const valid = this.rule_0_met;
			return { valid, invalid: !valid && this.hasSubmitted };
		},
		rule_1_class() {
			const valid = this.rule_1_met && this.password !== '';
			return { valid: valid && this.password };
		},
		rule_2_class() {
			const valid = this.rule_2_met;
			return { valid };
		},
		rule_3_class() {
			const valid = this.rule_3_met;
			return { valid };
		},
		rule_4_class() {
			const valid = this.rule_4_met;
			return { valid };
		},
		rule_5_class() {
			const valid = this.rule_5_met;
			return { valid };
		},

		username_rule_0_met() {
			// return true;
			return !!this.username__rules[0].test(this.username);
		},
		username_rule_1_met() {
			// return true
			return !!this.username__rules[1].test(this.username);
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
				this.username_search_loading = false;

				// set result to valid

				fetch('/data/usernames', {
					method: 'POST',
					body: JSON.stringify({ username: this.username }),
					headers: { 'Content-Type': 'application/json' },
				})
					.then(res => res.json())
					.then(res => {
						this.username_search_valid = res.exists;
					})
					.catch(err => console.error('Fetch username err', err));
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
