const { db } = require("../config/dbConfig");

const getReviewsByRadius = async (lat, lng, rad, search, page = 1, limit = 5) => {
    const offset = (page - 1) * limit;

    let query = `
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
    `;

    const params = [lng, lat, rad];
    let paramCounter = 4;

    if (search) {
        query += ` AND rest.name ILIKE $4`;
        params.push(`%${search}%`);   
        paramCounter++;        
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1};`;
    params.push(limit, offset);

  // $1 = lng, $2 = lat, $3 = rad, $4 = search
    return await db.any(query, params);
};

const getReviewsByCity = async (city, search, page = 1, limit = 5) => {
    const offset = (page - 1) * limit;

    let query = `
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
    `;
    const params = [city];
    let paramCounter = 2;

    if (search) {
        query += ` AND rest.name ILIKE $${paramCounter}`;
        params.push(`%${search}%`);
        paramCounter++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1};`;
    params.push(limit, offset);
    
    // $1 = city
    return await db.any(query, params);
};

module.exports = {
    getReviewsByRadius,
    getReviewsByCity,
};
