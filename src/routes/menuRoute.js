const express = require('express');

const router = express.Router();

const { getMenuItemsByBranchId, createMenuItem, getMenuItemByMenuItemId } = require('../controllers/menuController');
const { authenticateUser } = require('../middlewares/authMiddleware');

router.get('/:branchId', getMenuItemsByBranchId);
router.post('/', authenticateUser, createMenuItem);
router.get('/item/:menuItemId', getMenuItemByMenuItemId);

module.exports = router;