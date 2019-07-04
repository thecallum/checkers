const message = require('../components/message');

new Vue({
    el: '#app__image',
    components: { message },
    data: {
        loading: false,
        imageSelected: false,
        errorMessage: null,
        successMessage: null,
        imageUrl: '',
    },

    mounted() {
        const src = this.$refs['image'].dataset.src;
        if (src !== '') this.imageUrl = src;
    },

    methods: {
        inputChanged() {
            this.imageSelected = this.$refs.input.files.length > 0;
        },

        handleSubmit(e) {
            e.preventDefault();

            const file = e.target.uploaded_image.files[0];
            if (file === undefined) return;
            const fd = new FormData();
            fd.append('uploaded_image', file);

            this.loading = true;
            this.successMessage = null;
            this.errorMessage = null;

            fetch('/user/update/profile', {
                method: 'POST',
                body: fd,
                contentType: false,
                processData: false,
            })
                .then(res => {
                    if (res.status === 200 || res.status === 400) return res.json();

                    this.setError('Unknown error. try again');
                    this.$refs.input.value = null;
                    this.imageSelected = false;

                    return false;
                })
                .then(res => {
                    if (res) {
                        if (res.hasOwnProperty('error')) {
                            this.setError('Invalid image type');
                            this.$refs.input.value = null;
                            this.imageSelected = false;
                        } else {
                            this.imageUrl = res.url;
                            this.setSuccess('Profile image updated');
                        }
                    }
                })
                .catch(e => {
                    console.log('fetch err', e);
                    this.setError('Unknown error. try again');
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        setError(message) {
            this.successMessage = null;
            this.errorMessage = message;
        },

        setSuccess(message) {
            this.errorMessage = null;
            this.successMessage = message;
        },

        closeSuccessMessage() {
            this.successMessage = null;
        },

        closeErrorMessage() {
            this.errorMessage = null;
        },
    },
});
