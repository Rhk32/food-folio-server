const express = require('express');
const { getUserRestaurants } = require('../controllers/restaurantController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/my', authenticateUser, getUserRestaurants);

module.exports = router;