const { db } = require("../config/dbConfig");

const isUserFollowingService = async (followerUserId, followingUserId) => {
    try {
        const follow = await db.oneOrNone(
            `
            SELECT 1
            FROM follow
            WHERE follower_id = $1
              AND following_id = $2
            `,
            [followerUserId, followingUserId]
        );

        return !!follow;
    } catch (error) {
        console.error('Error checking follow status:', error);
        throw error;
    }
};

const toggleFollowService = async (followerId, followingId) => {
    try {
        const existingFollow = await db.oneOrNone(
            `
            SELECT 1
            FROM follow
            WHERE follower_id = $1
              AND following_id = $2
            `,
            [followerId, followingId]
        );

        if (existingFollow) {
            await db.none(
                `
                DELETE FROM follow
                WHERE follower_id = $1
                  AND following_id = $2
                `,
                [followerId, followingId]
            );

            return false;
        }

        await db.none(
            `
            INSERT INTO follow (
                follower_id,
                following_id
            )
            VALUES ($1, $2)
            `,
            [followerId, followingId]
        );

        return true;
    } catch (error) {
        console.error('Error toggling follow:', error);
        throw error;
    }
};

const getFollowerCountByUserIdService = async (userId) => {
    try {
        const result = await db.one(
            `
            SELECT COUNT(*)::int AS follower_count
            FROM follow
            WHERE following_id = $1
            `,
            [userId]
        );

        return result.follower_count;
    } catch (error) {
        console.error(
            'Error getting follower count:',
            error
        );

        throw error;
    }
};

module.exports = { isUserFollowingService, toggleFollowService, getFollowerCountByUserIdService };