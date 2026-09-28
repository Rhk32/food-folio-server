const reviewService = require('../services/reviewService');

const PAGE_SIZE = 10;
const COMMENT_PAGE_SIZE = 20;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parsePage = (value) => Math.max(1, Number.parseInt(value, 10) || 1);

const isValidImageUrl = (value) => {
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (error) {
        return false;
    }
};

const createReview = async (req, res) => {
    try {
        const branchId = req.body.branch_id;
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
        const rating = Number(req.body.rating);
        const imageUrls = Array.isArray(req.body.image_urls)
            ? req.body.image_urls.map((value) => String(value).trim()).filter(Boolean)
            : [];

        if (!UUID_PATTERN.test(branchId || '')) {
            return res.status(400).json({ message: 'A valid branch is required' });
        }

        if (!content) {
            return res.status(400).json({ message: 'Caption is required' });
        }

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer from 1 to 5' });
        }

        if (imageUrls.length === 0 || imageUrls.some((url) => !isValidImageUrl(url))) {
            return res.status(400).json({ message: 'At least one valid picture URL is required' });
        }

        const review = await reviewService.createReviewService({
            userId: req.user.userId,
            branchId,
            rating,
            content,
            imageUrls,
        });

        if (!review) {
            return res.status(404).json({ message: 'Approved restaurant branch not found' });
        }

        return res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
        console.error('Create review error:', error);
        return res.status(500).json({ message: 'Failed to create review' });
    }
};

const listReviews = async (req, res) => {
    try {
        const restaurantId = req.query.restaurantId || null;
        const userId = req.query.userId || null;

        if (restaurantId && !UUID_PATTERN.test(restaurantId)) {
            return res.status(400).json({ message: 'Invalid restaurant ID' });
        }

        if (userId && !UUID_PATTERN.test(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const page = parsePage(req.query.page);
        const result = await reviewService.listReviewsService({
            restaurantId,
            userId,
            viewerId: req.user?.userId,
            page,
            limit: PAGE_SIZE,
        });

        return res.status(200).json({ ...result, page, limit: PAGE_SIZE });
    } catch (error) {
        console.error('List reviews error:', error);
        return res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

const listComments = async (req, res) => {
    try {
        if (!UUID_PATTERN.test(req.params.reviewId || '')) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }
        const page = parsePage(req.query.page);
        const result = await reviewService.listCommentsService({
            reviewId: req.params.reviewId,
            page,
            limit: COMMENT_PAGE_SIZE,
        });

        return res.status(200).json({ ...result, page, limit: COMMENT_PAGE_SIZE });
    } catch (error) {
        console.error('List comments error:', error);
        return res.status(500).json({ message: 'Failed to fetch comments' });
    }
};

const createComment = async (req, res) => {
    try {
        if (!UUID_PATTERN.test(req.params.reviewId || '')) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }
        const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

        if (!content) {
            return res.status(400).json({ message: 'Comment cannot be empty' });
        }

        const comment = await reviewService.createCommentService({
            reviewId: req.params.reviewId,
            userId: req.user.userId,
            content,
        });

        if (!comment) {
            return res.status(404).json({ message: 'Review not found' });
        }

        return res.status(201).json({ message: 'Comment added', comment });
    } catch (error) {
        console.error('Create comment error:', error);
        return res.status(500).json({ message: 'Failed to add comment' });
    }
};

const toggleVouch = async (req, res) => {
    try {
        if (!UUID_PATTERN.test(req.params.reviewId || '')) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }
        const result = await reviewService.toggleVouchService({
            reviewId: req.params.reviewId,
            userId: req.user.userId,
        });

        if (!result) {
            return res.status(404).json({ message: 'Review not found' });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Toggle vouch error:', error);
        return res.status(500).json({ message: 'Failed to update vouch' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!UUID_PATTERN.test(reviewId || '')) {
            return res.status(400).json({ message: 'Invalid review ID' });
        }

        const result = await reviewService.deleteReviewByManagerService({
            reviewId,
            userId: req.user.userId,
        });

        if (result.status === 'forbidden') {
            return res.status(403).json({
                message: 'You do not manage the restaurant for this review',
            });
        }

        if (result.status === 'not_found') {
            return res.status(404).json({ message: 'Review not found' });
        }

        return res.status(200).json({
            message: 'Review deleted permanently',
            reviewId: result.reviewId,
        });
    } catch (error) {
        console.error('Delete review error:', error);
        return res.status(500).json({ message: 'Failed to delete review' });
    }
};

module.exports = { createReview, listReviews, listComments, createComment, toggleVouch, deleteReview };
