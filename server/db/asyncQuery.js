const asyncQuery = (con, query) => new Promise((resolve, reject) => {
    con.query(query, (err, queryResult) => {
        if (err) {
            reject(new Error(err))
        }
        resolve( queryResult )
    })
});

module.exports = asyncQuery;