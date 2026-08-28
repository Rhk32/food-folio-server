const { db } = require("../config/dbConfig");

const getReviewsByRadius = async (lat, lng) => {
    const query = `
        SELECT 
            r.id AS review_id, 
            r.content, 
            r.rating, 
            r.vouch_count, 
            r.created_at,
            u.name AS user_name, 
            u.profile_picture_url,
            b.branch_name, 
            b.city,
            rest.name AS restaurant_name, 
            rest.logo_url
        FROM review r
        JOIN users u ON r.user_id = u.id
        JOIN branches b ON r.branch_id = b.id
        JOIN restaurants rest ON b.restaurant_id = rest.id
        WHERE ST_DWithin(
            b.coordinates, 
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
            $3
        )
        ORDER BY r.created_at DESC
        LIMIT 50;
    `;

  // $1 = lng, $2 = lat
    return await db.any(query, [lng, lat, rad]);
};

const getReviewsByCity = async (city) => {
    const query = `
        SELECT 
            r.id AS review_id, 
            r.content, 
            r.rating, 
            r.vouch_count, 
            r.created_at,
            u.name AS user_name, 
            u.profile_picture_url,
            b.branch_name, 
            b.city,
            rest.name AS restaurant_name, 
            rest.logo_url
        FROM review r
        JOIN users u ON r.user_id = u.id
        JOIN branches b ON r.branch_id = b.id
        JOIN restaurants rest ON b.restaurant_id = rest.id
        WHERE b.city ILIKE $1
        ORDER BY r.created_at DESC
        LIMIT 50;
    `;

  // $1 = city
    return await db.any(query, [city]);
};

module.exports = {
    getReviewsByRadius,
    getReviewsByCity,
};
