const asyncQuery = (con, query) => new Promise((resolve, reject) => {
    con.query(query, (err, queryResult) => {
        if (err) return reject(err);
        resolve(queryResult);
    })
});

module.exports = asyncQuery;