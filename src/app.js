const express = require('express');
const cors = require('cors');

const serverHealthRoute = require('./routes/serverHealthRoute');
const authRoute = require('./routes/authRoute');

const app = express();

app.use(cors());
app.use(express.json());

// health APIs
app.use('/', serverHealthRoute);

// authentication APIs
app.use('/api/auth', authRoute);

module.exports = app;