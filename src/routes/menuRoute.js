const express = require('express');

const router = express.Router();

const { getMenuItemsByBranchId, createMenuItem } = require('../controllers/menuController');
const { authenticateUser } = require('../middlewares/authMiddleware');

router.get('/:branchId', getMenuItemsByBranchId);
router.post('/', authenticateUser, createMenuItem);

module.exports = router;