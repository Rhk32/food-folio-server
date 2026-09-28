const { db } = require('../config/dbConfig');

const searchUsers = async ({ query, page, limit }) => {
    if (!query) return [];

    return db.manyOrNone(
        `
        SELECT
            id,
            created_at,
            name,
            profile_picture_url,
            current_city,
            current_country,
            bio,
            COUNT(*) OVER()::int AS total_count
        FROM users
        WHERE name ILIKE $1
        ORDER BY name ASC, id ASC
        LIMIT $2 OFFSET $3
        `,
        [`%${query}%`, limit, (page - 1) * limit]
    );
};

const searchRestaurants = async ({ query, city, cuisineId, page, limit }) => {
    return db.manyOrNone(
        `
        SELECT
            r.id,
            r.created_at,
            r.name,
            r.logo_url,
            r.description,
            r.visits,
            COALESCE(
                ARRAY_AGG(DISTINCT b.city) FILTER (WHERE b.city IS NOT NULL),
                ARRAY[]::text[]
            ) AS cities,
            COALESCE(
                ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL),
                ARRAY[]::text[]
            ) AS cuisines,
            COUNT(DISTINCT rev.id)::int AS review_count,
            COALESCE(ROUND(AVG(rev.rating)::numeric, 1), 0) AS average_rating,
            COUNT(*) OVER()::int AS total_count
        FROM restaurants r
        LEFT JOIN branches b ON b.restaurant_id = r.id
        LEFT JOIN restaurant_cuisine rc ON rc.restaurant_id = r.id
        LEFT JOIN cuisine c ON c.id = rc.cuisine_id
        LEFT JOIN review rev ON rev.branch_id = b.id
        WHERE r.approval_status = 'approved'
          AND ($1 = '' OR r.name ILIKE $2)
          AND (
              $3 = '' OR EXISTS (
                  SELECT 1 FROM branches city_branch
                  WHERE city_branch.restaurant_id = r.id
                    AND city_branch.city ILIKE $3
              )
          )
          AND (
              $4::uuid IS NULL OR EXISTS (
                  SELECT 1 FROM restaurant_cuisine cuisine_filter
                  WHERE cuisine_filter.restaurant_id = r.id
                    AND cuisine_filter.cuisine_id = $4
              )
          )
        GROUP BY r.id
        ORDER BY r.name ASC, r.id ASC
        LIMIT $5 OFFSET $6
        `,
        [query, `%${query}%`, city, cuisineId || null, limit, (page - 1) * limit]
    );
};

const getSearchFilters = async () => {
    const [cities, cuisines] = await Promise.all([
        db.manyOrNone(
            `
            SELECT DISTINCT b.city
            FROM branches b
            INNER JOIN restaurants r ON r.id = b.restaurant_id
            WHERE r.approval_status = 'approved'
              AND b.city IS NOT NULL
              AND BTRIM(b.city) <> ''
            ORDER BY b.city ASC
            `
        ),
        db.manyOrNone(
            `
            SELECT DISTINCT c.id, c.name
            FROM cuisine c
            INNER JOIN restaurant_cuisine rc ON rc.cuisine_id = c.id
            INNER JOIN restaurants r ON r.id = rc.restaurant_id
            WHERE r.approval_status = 'approved'
            ORDER BY c.name ASC
            `
        ),
    ]);

    return {
        cities: cities.map((item) => item.city),
        cuisines,
    };
};

module.exports = { searchUsers, searchRestaurants, getSearchFilters };
