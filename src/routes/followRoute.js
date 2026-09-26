const express = require('express');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { isUserFollowing, toggleFollow, getFollowerCountByUserId } = require('../controllers/followController');

const router = express.Router();

router.get('/is-following/:followerUserId/:followedUserId', isUserFollowing);
router.patch('/toggle/:followingId', authenticateUser, toggleFollow);
router.get('/follower-count/:userId', getFollowerCountByUserId);

module.exports = router;