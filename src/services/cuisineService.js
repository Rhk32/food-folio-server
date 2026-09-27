const { db } = require("../config/dbConfig");

const getCuisinesByRestaurantIdService = async (restaurantId) => {
    try {
        return await db.manyOrNone(
            `
            SELECT
                c.id,
                c.name
            FROM restaurant_cuisine AS rc
            INNER JOIN cuisine AS c
                ON c.id = rc.cuisine_id
            WHERE rc.restaurant_id = $1
            ORDER BY c.name ASC
            `,
            [restaurantId]
        );
    } catch (error) {
        console.error('Error fetching restaurant cuisines:', error);
        throw error;
    }
};

module.exports = { getCuisinesByRestaurantIdService };