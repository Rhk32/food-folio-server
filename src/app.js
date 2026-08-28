const express = require('express');
const cors = require('cors');

const serverHealthRoute = require('./routes/serverHealthRoute');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const feedRoute = require('./routes/feedRoute');

const app = express();

app.use(cors());
app.use(express.json());

// health APIs
app.use('/', serverHealthRoute);

// authentication APIs
app.use('/api/auth', authRoute);

// user related APIs
app.use('/api/users', userRoute)

// restaurant APIs
app.use('/api/restaurant', restaurantRoute);

// feed APIs
app.use('/api/feed', feedRoute);

module.exports = app;