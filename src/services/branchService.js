const { db } = require("../config/dbConfig");

const getBranchesByRestaurantIdService = async (restaurantId) => {
    try {
        const branches = await db.manyOrNone(
            `
            SELECT *
            FROM branches
            WHERE restaurant_id = $1
            ORDER BY branch_name ASC
            `,
            [restaurantId]
        );

        return branches;
    } catch (error) {
        console.error('Error fetching branches:', error);
        throw error;
    }
};

const createBranchService = async ({ restaurantId, branchName, address, city, latitude, longitude, googleMapsUrl }) => {
    try {
        const branch = await db.one(
            `
            INSERT INTO branches (
                restaurant_id,
                branch_name,
                address,
                city,
                coordinates,
                google_maps_url
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                ST_SetSRID(
                    ST_MakePoint($6, $5),
                    4326
                )::geography,
                $7
            )
            RETURNING *
            `,
            [
                restaurantId,
                branchName,
                address,
                city,
                latitude,
                longitude,
                googleMapsUrl,
            ]
        );

        return branch;
    } catch (error) {
        console.error('Error creating branch:', error);
        throw error;
    }
};

module.exports = { getBranchesByRestaurantIdService, createBranchService };