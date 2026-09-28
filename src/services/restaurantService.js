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

const postRestaurantByUserIdAndRestaurantManager = async (userId, name, description, logoUrl) => {
    try {
        return await db.tx(async (t) => {
            // 1. Create the restaurant
            const restaurant = await t.one(
                `
                INSERT INTO restaurants (name, description, logo_url)
                VALUES ($1, $2, $3)
                RETURNING *
                `,
                [name, description, logoUrl]
            );

            // 2. Create the relationship between the user and restaurant
            await t.none(
                `
                INSERT INTO restaurant_manager (user_id, restaurant_id)
                VALUES ($1, $2)
                `,
                [userId, restaurant.id]
            );

            // 3. Return the newly created restaurant
            return restaurant;
        });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        throw error;
    }
};

const getUnapprovedRestaurantsService = async () => {
    try {
        const restaurants = await db.manyOrNone(
            `
            SELECT *
            FROM restaurants
            WHERE approval_status = $1
            ORDER BY created_at DESC
            `,
            ['pending']
        );

        return restaurants;
    } catch (error) {
        console.error('Error fetching unapproved restaurants:', error);
        throw error;
    }
};

const updateRestaurantApprovalService = async (restaurantId, approvalStatus) => {
    try {
        const restaurant = await db.oneOrNone(
            `
            UPDATE restaurants
            SET approval_status = $1
            WHERE id = $2
            RETURNING *
            `,
            [approvalStatus, restaurantId]
        );

        return restaurant;
    } catch (error) {
        console.error('Error updating restaurant approval:', error);
        throw error;
    }
};

const getRestaurantByRestaurantIdService = async (restaurantId) => {
    try {
        const restaurant = await db.oneOrNone(
            `
            SELECT *
            FROM restaurants
            WHERE id = $1
            `,
            [restaurantId]
        );

        return restaurant;
    } catch (error) {
        console.error('Error fetching restaurant by ID:', error);
        throw error;
    }
};

const getPublicRestaurantByIdService = async (restaurantId) => {
    return db.task(async (task) => {
        const restaurant = await task.oneOrNone(
            `
            SELECT id, created_at, name, logo_url, description, visits
            FROM restaurants
            WHERE id = $1 AND approval_status = 'approved'
            `,
            [restaurantId]
        );

        if (!restaurant) return null;

        const cuisines = await task.manyOrNone(
                `
                SELECT c.id, c.name
                FROM restaurant_cuisine rc
                INNER JOIN cuisine c ON c.id = rc.cuisine_id
                WHERE rc.restaurant_id = $1
                ORDER BY c.name ASC
                `,
                [restaurantId]
            );
        const branches = await task.manyOrNone(
                `
                SELECT
                    b.id,
                    b.branch_name,
                    b.address,
                    b.city,
                    b.google_maps_url,
                    ST_Y(b.coordinates::geometry) AS latitude,
                    ST_X(b.coordinates::geometry) AS longitude,
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', mi.id,
                                'name', mi.name,
                                'description', mi.description,
                                'price', mi.price
                            ) ORDER BY mi.name
                        ) FILTER (WHERE mi.id IS NOT NULL),
                        '[]'::json
                    ) AS menu_items
                FROM branches b
                LEFT JOIN menu_item mi ON mi.branch_id = b.id
                WHERE b.restaurant_id = $1
                GROUP BY b.id
                ORDER BY b.branch_name ASC
                `,
                [restaurantId]
            );
        const galleryImages = await task.manyOrNone(
                `
                SELECT id, review_id, image_url, created_at
                FROM gallery_image
                WHERE restaurant_id = $1
                ORDER BY created_at DESC
                `,
                [restaurantId]
            );

        return { ...restaurant, cuisines, branches, gallery_images: galleryImages };
    });
};

const checkRestaurantManagerService = async (userId, restaurantId) => {
    try {
        const manager = await db.oneOrNone(
            `
            SELECT 1
            FROM restaurant_manager
            WHERE user_id = $1
              AND restaurant_id = $2
            `,
            [userId, restaurantId]
        );

        return !!manager;
    } catch (error) {
        console.error('Error checking restaurant manager:', error);
        throw error;
    }
};

const checkRestaurantManagerByBranchIdService = async (userId, branchId) => {
    try {
        const manager = await db.oneOrNone(
            `
            SELECT 1
            FROM restaurant_manager AS rm
            INNER JOIN branches AS b
                ON b.restaurant_id = rm.restaurant_id
            WHERE rm.user_id = $1
              AND b.id = $2
            `,
            [userId, branchId]
        );

        return !!manager;
    } catch (error) {
        console.error(
            'Error checking branch manager:',
            error
        );

        throw error;
    }
};

module.exports = { getUserRestaurantsByUserID, postRestaurantByUserIdAndRestaurantManager, getUnapprovedRestaurantsService, updateRestaurantApprovalService, getRestaurantByRestaurantIdService, getPublicRestaurantByIdService, checkRestaurantManagerService, checkRestaurantManagerByBranchIdService };
