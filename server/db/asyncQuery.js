const asyncQuery = (con, query) => new Promise((resolve, reject) => {
    con.query(query, (err, queryResult) => {
        if (err) return resolve({ success: false, error: err });
        resolve({ success: true, response: queryResult });
    })
});

module.exports = asyncQuery;