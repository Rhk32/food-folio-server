const express = require('express');
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// db => database
// pgp => pg-promise module
const { db, pgp, testConnection } = require('./config/dbConfig');

app.get('/', async (req, res) => {
    res.json(crypto.randomUUID());
});

app.listen(port, () => {
    console.log(`Food Folio listening on port ${port}`);
    testConnection();
});