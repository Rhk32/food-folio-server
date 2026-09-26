const express = require('express');

const router = express.Router();

const { getMenuItemsByBranchId } = require('../controllers/menuController');

router.get('/:branchId', getMenuItemsByBranchId);

module.exports = router;