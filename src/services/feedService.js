const { db } = require('../config/dbConfig');

const reviewSelect = `
    SELECT
        r.id AS review_id,
        r.content,
        r.rating,
        r.vouch_count,
        r.created_at,
        JSON_BUILD_OBJECT(
            'id', u.id,
            'name', u.name,
            'profile_picture_url', u.profile_picture_url
        ) AS author,
        JSON_BUILD_OBJECT(
            'id', rest.id,
            'name', rest.name,
            'logo_url', rest.logo_url
        ) AS restaurant,
        JSON_BUILD_OBJECT(
            'id', b.id,
            'name', b.branch_name,
            'city', b.city
        ) AS branch,
        COALESCE(images.items, '[]'::json) AS images,
        COALESCE(comments.comment_count, 0)::int AS comment_count,
        CASE
            WHEN $/viewerId/::uuid IS NULL THEN false
            ELSE EXISTS (
                SELECT 1 FROM vouch v
                WHERE v.review_id = r.id AND v.user_id = $/viewerId/
            )
        END AS has_vouched,
        COUNT(*) OVER()::int AS total_count
    FROM review r
    INNER JOIN users u ON u.id = r.user_id
    INNER JOIN branches b ON b.id = r.branch_id
    INNER JOIN restaurants rest ON rest.id = b.restaurant_id
    LEFT JOIN LATERAL (
        SELECT JSON_AGG(
            JSON_BUILD_OBJECT('id', gi.id, 'image_url', gi.image_url)
            ORDER BY gi.created_at ASC
        ) AS items
        FROM gallery_image gi
        WHERE gi.review_id = r.id
    ) images ON true
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS comment_count
        FROM comment c
        WHERE c.review_id = r.id
    ) comments ON true
`;

const normalizeRows = (rows) => ({
    items: rows.map(({ total_count, ...review }) => review),
    total: rows[0]?.total_count ?? 0,
});

const getReviewsByRadius = async ({ lat, lng, radius, search, page, limit, viewerId }) => {
    const rows = await db.manyOrNone(
        `${reviewSelect}
        WHERE rest.approval_status = 'approved'
          AND b.coordinates IS NOT NULL
          AND ST_DWithin(
              b.coordinates,
              ST_SetSRID(ST_MakePoint($/lng/, $/lat/), 4326)::geography,
              $/radius/
          )
          AND ($/search/ = '' OR rest.name ILIKE $/searchPattern/)
        ORDER BY r.created_at DESC, r.id DESC
        LIMIT $/limit/ OFFSET $/offset/
        `,
        {
            lat,
            lng,
            radius,
            search,
            searchPattern: `%${search}%`,
            limit,
            offset: (page - 1) * limit,
            viewerId: viewerId || null,
        }
    );

    return normalizeRows(rows);
};

const getReviewsByCity = async ({ city, search, page, limit, viewerId }) => {
    const rows = await db.manyOrNone(
        `${reviewSelect}
        WHERE rest.approval_status = 'approved'
          AND b.city ILIKE $/city/
          AND ($/search/ = '' OR rest.name ILIKE $/searchPattern/)
        ORDER BY r.created_at DESC, r.id DESC
        LIMIT $/limit/ OFFSET $/offset/
        `,
        {
            city,
            search,
            searchPattern: `%${search}%`,
            limit,
            offset: (page - 1) * limit,
            viewerId: viewerId || null,
        }
    );

    return normalizeRows(rows);
};

module.exports = { getReviewsByRadius, getReviewsByCity };
