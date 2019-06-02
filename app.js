const expressServer = require('./server/expressServer');
const PORT = 4000 || process.env.PORT;

const path = require('path');
const fileName = path.basename(__filename);

expressServer().then(server => {
    console.log('started');

    server.listen(PORT, () => console.log(`${fileName} is running on https://localhost:${PORT}`));

    console.log('listening')
});