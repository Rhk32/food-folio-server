const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { getBranchesByRestaurantId, createBranch, getBranchByBranchId } = require('../controllers/branchController');
const router = express.Router();

router.get('/restaurant/:restaurantId', authenticateUser, getBranchesByRestaurantId);
router.post('/add', authenticateUser, createBranch);
router.get('/:branchId', getBranchByBranchId);

module.exports = router;