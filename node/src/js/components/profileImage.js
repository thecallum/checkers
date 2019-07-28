const message = require('../components/message');

new Vue({
    el: '#app__image',
    components: { message },
    data: {
        saveLoading: false,
        deleteLoading: false,
        imageSelected: false,
        errorMessage: null,
        successMessage: null,
        imageURL: '',
    },

    mounted() {
        const src = this.$refs['image'].dataset.src;
        if (src !== '') this.imageURL = src;
    },

    methods: {
        inputChanged() {
            this.imageSelected = this.$refs.input.files.length > 0;
        },

        handleSubmit(e) {
            e.preventDefault();

            const file = this.$refs.input.files[0];
            if (file === undefined) return;
            const fd = new FormData();
            fd.append('uploaded_image', file);

            this.saveLoading = true;
            this.successMessage = null;
            this.errorMessage = null;

            fetch('/user/update/update-profile', {
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
                        } else {
                            this.imageURL = res.url;
                            this.$refs.input.value = null;
                            this.imageSelected = false;
                            this.setSuccess('Profile image updated');
                        }
                    }
                })
                .catch(e => {
                    console.log('fetch err', e);
                    this.setError('Unknown error. try again');
                })
                .finally(() => {
                    this.saveLoading = false;
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

        deleteProfileImage() {
            this.deleteLoading = true;

            fetch('/user/update/delete-profile', {
                method: 'POST',
            })
                .then(res => {
                    if (res.status === 200) {
                        this.setSuccess('Profile image deleted');
                        this.imageURL = '';
                    } else {
                        this.setError('Unknown error. try again');
                    }
                })

                .catch(e => {
                    console.log('fetch err', e);
                    this.setError('Unknown error. try again');
                })
                .finally(() => {
                    this.deleteLoading = false;
                });
        },
    },
});
