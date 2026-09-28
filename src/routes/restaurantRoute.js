const express = require('express');
const { getUserRestaurants, createRestaurant, getUnapprovedRestaurants, updateRestaurantApproval, getRestaurantByRestaurantId } = require('../controllers/restaurantController');
const { authenticateUser, authenticateAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/my', authenticateUser, getUserRestaurants);
router.post('/create', authenticateUser, createRestaurant);
router.get('/unapproved', authenticateAdmin, getUnapprovedRestaurants);
router.patch('/:id/approval', authenticateAdmin, updateRestaurantApproval);
router.get('/:restaurantId', authenticateUser, getRestaurantByRestaurantId);

module.exports = router;