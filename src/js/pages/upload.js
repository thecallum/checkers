new Vue({
    el: '#app',
    data: {
        responseURL: null,
    },

    methods: {
        handleSubmit(e) {
            e.preventDefault();

            const file = e.target.uploaded_image.files[0];

            if (file === undefined) return;

            const fd = new FormData();

            fd.append('uploaded_image', file);

            fetch('/user/update/profile', {
                method: 'POST',
                body: fd,
                contentType: false,
                processData: false,
            })
                .then(res => {
                    console.log({ status: res.status });
                    if (res.status === 200) return res.json();
                    return false;
                })
                .then(res => {
                    console.log({ res });
                    this.responseURL = res.url;
                })
                .catch(e => {
                    console.log('fetch err', e);
                });
        },
    },
});
