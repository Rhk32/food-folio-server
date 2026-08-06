const express = require('express');
const serverHealthController = require('../controllers/serverHealthController');

const router = express.Router();

router.get('/', serverHealthController.getHealthStatus);

module.exports = router;