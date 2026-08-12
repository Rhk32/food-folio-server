const { db } = require('../config/dbConfig');

// Fetches all restaurants managed by this userId
const getUserRestaurantsByUserID = async (userId) => {
    try {
        const restaurants = await db.manyOrNone(
            `
            SELECT r.*
            FROM restaurants AS r
            INNER JOIN restaurant_manager AS rm
                ON r.id = rm.restaurant_id
            WHERE rm.user_id = $1
            ORDER BY r.created_at DESC
            `,
            [userId]
        );

        return restaurants;
    } catch (error) {
        console.error('Could not get restaurants under this user:', error);
        throw error;
    }
};

module.exports = { getUserRestaurantsByUserID };