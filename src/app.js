const express = require('express');
const cors = require('cors');

const serverHealthRoute = require('./routes/serverHealthRoute');

const app = express();

app.use(cors());
app.use(express.json());

// health api
app.use('/', serverHealthRoute);

module.exports = app;