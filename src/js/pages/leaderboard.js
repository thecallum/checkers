new Vue({
    el: '#app',

    data: {
        offset: 0,
        interval: 50,

        data: null,
        next: false,
        back: false,
        total: 0,
    },

    created() {
        this.data = loaded.data;
        this.next = loaded.next;
        this.back = loaded.back;
        this.total = loaded.total;
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
                    .then(res => resolve(res))
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
