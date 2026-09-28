const express = require('express');
const { getCuisinesByRestaurantId, postCuisineByRestaurantId } = require('../controllers/cuisineController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/restaurant/:restaurantId', getCuisinesByRestaurantId);
router.post('/restaurant/:restaurantId', authenticateUser, postCuisineByRestaurantId);

module.exports = router;