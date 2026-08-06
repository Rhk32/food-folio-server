require('dotenv').config();

const app = require('./src/app.js');
const { testConnection } = require('./src/config/dbConfig.js');

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Food Folio listening on port ${port}`);
    testConnection();
});