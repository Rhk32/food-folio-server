const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { getCurrentUser, getProfileDisplayUserById, updateProfileBasicInformation, updatePassword } = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticateUser, getCurrentUser);
router.get('/profile/getUser/:userId', getProfileDisplayUserById);
router.patch('/profile/edit', authenticateUser, updateProfileBasicInformation);
router.patch('/profile/edit/password', authenticateUser, updatePassword);

module.exports = router;