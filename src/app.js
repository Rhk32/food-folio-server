const express = require('express');
const cors = require('cors');

const serverHealthRoute = require('./routes/serverHealthRoute');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const branchRoute = require('./routes/branchRoute');
const followRoute = require('./routes/followRoute');
const menuRoute = require('./routes/menuRoute');

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

// branch APIs
app.use('/api/branch', branchRoute);

// follow APIs
app.use('/api/follow', followRoute);

// menu APIs
app.use('/api/menu', menuRoute);
module.exports = app;