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

const postCuisineByRestaurantIdService = async (restaurantId, name) => {
    try {
        return await db.tx(async (t) => {
            const cuisine = await t.oneOrNone(
                `
                SELECT id, name
                FROM cuisine
                WHERE LOWER(name) = LOWER($1)
                `,
                [name.trim()]
            );

            if (!cuisine) {
                return {
                    status: 'not_found',
                };
            }

            const restaurantCuisine = await t.oneOrNone(
                `
                INSERT INTO restaurant_cuisine (
                    restaurant_id,
                    cuisine_id
                )
                VALUES ($1, $2)
                ON CONFLICT (restaurant_id, cuisine_id)
                DO NOTHING
                RETURNING restaurant_id, cuisine_id
                `,
                [restaurantId, cuisine.id]
            );

            if (!restaurantCuisine) {
                return {
                    status: 'already_exists',
                };
            }

            return {
                status: 'created',
                restaurantCuisine: {
                    ...restaurantCuisine,
                    name: cuisine.name,
                },
            };
        });
    } catch (error) {
        console.error('Error adding cuisine to restaurant:', error);
        throw error;
    }
};

module.exports = { getCuisinesByRestaurantIdService, postCuisineByRestaurantIdService };