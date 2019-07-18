const passwordRules = {
    props: {
        password: { required: true, type: String },
        showValidation: { required: true, type: Boolean },
        rules: { required: true, type: Array },
        show: { required: true, type: Boolean },
        toggle: { required: true, type: Function },
    },

    computed: {
        rule0() {
            const valid = this.rules[0];
            return { valid, invalid: !valid && this.showValidation };
        },
        rule1() {
            const valid = this.rules[1] && this.password !== '';
            return { valid: valid && this.password };
        },
        rule2() {
            const valid = this.rules[2];
            return { valid };
        },
        rule3() {
            const valid = this.rules[3];
            return { valid };
        },
        rule4() {
            const valid = this.rules[4];
            return { valid };
        },
        rule5() {
            const valid = this.rules[5];
            return { valid };
        },
    },

    template: `
        <ul class="passwordRules" v-bind:class="{ active: show }">
            <button class="passwordRules__toggle" @click="toggle" type="button"></button>

            <h5>Password Rules</h5>

            <li class="passwordRules__rule" v-bind:class="rule0">
                Between 10-128 Characters
            </li>
            
            <li class="passwordRules__rule" v-bind:class="rule1">
                Not more than 2 identical characters in a row (e.g., 111 not allowed)
            </li>

            <h4 class="passwordRules__subtitle">
                Must meet at least 3 of the following 4 complexity rules:
            </h4>

            <li class="passwordRules__rule" v-bind:class="rule2">
                At least 1 uppercase character (A-Z)
            </li>

            <li class="passwordRules__rule" v-bind:class="rule3">
                At least 1 lowercase character (a-z)
            </li>

            <li class="passwordRules__rule" v-bind:class="rule4">
                At least 1 digit (0-9)
            </li>

            <li class="passwordRules__rule" v-bind:class="rule5">
                At least 1 special character (punctuation, space counts as special characters)
            </li>
        </ul>
    `,
};

module.exports = passwordRules;
