const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { getBranchesByRestaurantId, createBranch } = require('../controllers/branchController');
const router = express.Router();

router.get('/restaurant/:restaurantId', authenticateUser, getBranchesByRestaurantId);
router.post('/add', authenticateUser, createBranch);

module.exports = router;