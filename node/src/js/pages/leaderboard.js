new Vue({
    el: '#app',

    data: {
        offset: 0,
        interval: 50,

        loadedData: false,
        data: null,
        next: false,
        back: false,
        total: 0,
    },

    methods: {
        fetchData(offset) {
            return new Promise(resolve => {
                fetch('/data/leaderboard', {
                    method: 'POST',
                    body: JSON.stringify({ offset }),
                    headers: { 'Content-Type': 'application/json' },
                })
                    .then(res => res.json())
                    .then(res => {
                        this.loadedData = true;
                        resolve(res);
                    })
                    .catch(err => {
                        console.log('fetch err', err);
                        resolve(false);
                    });
            });
        },

        updateData(data) {
            Object.keys(data).forEach(key => (this[key] = data[key]));
        },

        handleNext() {
            this.fetchData(this.offset + 1).then(res => {
                if (res) this.updateData({ ...res, offset: this.offset + 1 });
            });
        },

        handleBack() {
            this.fetchData(this.offset - 1).then(res => {
                if (res) this.updateData({ ...res, offset: this.offset - 1 });
            });
        },
    },
});
