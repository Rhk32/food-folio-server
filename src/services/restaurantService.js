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

module.exports = { getUserRestaurantsByUserID, postRestaurantByUserIdAndRestaurantManager, getUnapprovedRestaurantsService, updateRestaurantApprovalService, getRestaurantByRestaurantIdService, checkRestaurantManagerService };