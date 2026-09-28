const { isUserFollowingService, toggleFollowService, getFollowerCountByUserIdService } = require("../services/followService");

const isUserFollowing = async (req, res) => {
    try {
        const { followerUserId, followedUserId } = req.params;

        if (!followerUserId || !followedUserId) {
            return res.status(400).json({
                message: 'Both user IDs are required',
            });
        }

        const isFollowing = await isUserFollowingService(followerUserId, followedUserId);

        return res.status(200).json({
            isFollowing,
        });
    } catch (error) {
        console.error(
            'Error in isUserFollowing controller:',
            error
        );

        return res.status(500).json({
            message: 'Failed to check follow status',
        });
    }
};

const toggleFollow = async (req, res) => {
    try {
        const followerId = req.user.userId;
        const { followingId } = req.params;

        if (!followingId) {
            return res.status(400).json({
                message: 'Following user ID is required',
            });
        }

        if (followerId === followingId) {
            return res.status(400).json({
                message: 'You cannot follow yourself',
            });
        }

        const isFollowing = await toggleFollowService(followerId, followingId);

        return res.status(200).json({
            message: isFollowing
                ? 'User followed successfully'
                : 'User unfollowed successfully',
            isFollowing,
        });
    } catch (error) {
        console.error('Error in toggleFollow:', error);

        return res.status(500).json({
            message: 'Failed to update follow status',
        });
    }
};

const getFollowerCountByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required',
            });
        }

        const followerCount = await getFollowerCountByUserIdService(userId);

        return res.status(200).json({
            followerCount,
        });
    } catch (error) {
        console.error(
            'Error in getFollowerCountByUserId:',
            error
        );

        return res.status(500).json({
            message: 'Failed to fetch follower count',
        });
    }
};

module.exports = { isUserFollowing, toggleFollow, getFollowerCountByUserId };