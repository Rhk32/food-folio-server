const express = require('express');
const { getUserRestaurants, createRestaurant } = require('../controllers/restaurantController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/my', authenticateUser, getUserRestaurants);
router.post('/create', authenticateUser, createRestaurant);

module.exports = router;