const express = require('express');
const { authenticateUser, optionallyAuthenticateUser } = require('../middlewares/authMiddleware');
const { createReview, listReviews, listComments, createComment, toggleVouch } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', optionallyAuthenticateUser, listReviews);
router.post('/', authenticateUser, createReview);
router.get('/:reviewId/comments', listComments);
router.post('/:reviewId/comments', authenticateUser, createComment);
router.patch('/:reviewId/vouch', authenticateUser, toggleVouch);

module.exports = router;
