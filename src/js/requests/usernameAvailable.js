const usernameAvailable = username =>
    new Promise((resolve, reject) => {
        fetch('/data/usernames', {
            method: 'POST',
            body: JSON.stringify({ username }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => {
                if (res.status !== 200) reject(res.status);
                return res.json();
            })
            .then(res => {
                resolve(res.exists);
            })
            .catch(reject);
    });

module.exports = usernameAvailable;
