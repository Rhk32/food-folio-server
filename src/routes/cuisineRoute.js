const express = require('express');
const { getCuisinesByRestaurantId } = require('../controllers/cuisineController');
const router = express.Router();

router.get('/restaurant/:restaurantId', getCuisinesByRestaurantId);

module.exports = router;