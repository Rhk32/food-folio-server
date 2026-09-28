const express = require('express');
const cors = require('cors');

const serverHealthRoute = require('./routes/serverHealthRoute');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const feedRoute = require('./routes/feedRoute');
const branchRoute = require('./routes/branchRoute');
const followRoute = require('./routes/followRoute');
const menuRoute = require('./routes/menuRoute');
const cuisineRoute = require('./routes/cuisineRoute');

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

// branch APIs
app.use('/api/branch', branchRoute);

// follow APIs
app.use('/api/follow', followRoute);

// menu APIs
app.use('/api/menu', menuRoute);

// cuisine APIs
app.use('/api/cuisine', cuisineRoute);

module.exports = app;