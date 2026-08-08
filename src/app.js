const express = require('express');
const cors = require('cors');

const serverHealthRoute = require('./routes/serverHealthRoute');
const authRoute = require('./routes/authRoute');

const app = express();

app.use(cors());
app.use(express.json());

// health api
app.use('/', serverHealthRoute);

// authentication api
app.use('/api/auth', authRoute);

module.exports = app;