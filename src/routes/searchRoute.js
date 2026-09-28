const express = require('express');
const { search, getFilters } = require('../controllers/searchController');

const router = express.Router();

router.get('/filters', getFilters);
router.get('/', search);

module.exports = router;
