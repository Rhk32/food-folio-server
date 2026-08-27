const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { getCurrentUser, getProfileDisplayUserById } = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticateUser, getCurrentUser);
router.get('/profile/getUser/:userId', getProfileDisplayUserById);

module.exports = router;