const { db } = require('../config/dbConfig');

const createReviewService = async ({ userId, branchId, rating, content, imageUrls }) => {
    return db.tx(async (transaction) => {
        const branch = await transaction.oneOrNone(
            `
            SELECT b.id, b.restaurant_id
            FROM branches b
            INNER JOIN restaurants r ON r.id = b.restaurant_id
            WHERE b.id = $1 AND r.approval_status = 'approved'
            `,
            [branchId]
        );

        if (!branch) return null;

        const review = await transaction.one(
            `
            INSERT INTO review (user_id, branch_id, content, rating)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [userId, branch.id, content, rating]
        );

        await transaction.none(
            `
            INSERT INTO gallery_image (
                restaurant_id,
                branch_id,
                user_id,
                review_id,
                image_url
            )
            SELECT $1, $2, $3, $4, image_url
            FROM UNNEST($5::text[]) AS image_url
            `,
            [branch.restaurant_id, branch.id, userId, review.id, imageUrls]
        );

        return { ...review, image_urls: imageUrls };
    });
};

const listReviewsService = async ({ restaurantId, userId, viewerId, page, limit }) => {
    const rows = await db.manyOrNone(
        `
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
                WHEN $3::uuid IS NULL THEN false
                ELSE EXISTS (
                    SELECT 1 FROM vouch v
                    WHERE v.review_id = r.id AND v.user_id = $3
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
        WHERE rest.approval_status = 'approved'
          AND ($1::uuid IS NULL OR rest.id = $1)
          AND ($2::uuid IS NULL OR u.id = $2)
        ORDER BY r.created_at DESC, r.id DESC
        LIMIT $4 OFFSET $5
        `,
        [restaurantId || null, userId || null, viewerId || null, limit, (page - 1) * limit]
    );

    return {
        items: rows.map(({ total_count, ...review }) => review),
        total: rows[0]?.total_count ?? 0,
    };
};

const listCommentsService = async ({ reviewId, page, limit }) => {
    const rows = await db.manyOrNone(
        `
        SELECT
            c.id,
            c.content,
            c.created_at,
            JSON_BUILD_OBJECT(
                'id', u.id,
                'name', u.name,
                'profile_picture_url', u.profile_picture_url
            ) AS author,
            COUNT(*) OVER()::int AS total_count
        FROM comment c
        INNER JOIN users u ON u.id = c.user_id
        INNER JOIN review r ON r.id = c.review_id
        INNER JOIN branches b ON b.id = r.branch_id
        INNER JOIN restaurants rest ON rest.id = b.restaurant_id
        WHERE c.review_id = $1 AND rest.approval_status = 'approved'
        ORDER BY c.created_at ASC, c.id ASC
        LIMIT $2 OFFSET $3
        `,
        [reviewId, limit, (page - 1) * limit]
    );

    return {
        items: rows.map(({ total_count, ...comment }) => comment),
        total: rows[0]?.total_count ?? 0,
    };
};

const createCommentService = async ({ reviewId, userId, content }) => {
    return db.oneOrNone(
        `
        INSERT INTO comment (review_id, user_id, content)
        SELECT r.id, $2, $3
        FROM review r
        INNER JOIN branches b ON b.id = r.branch_id
        INNER JOIN restaurants rest ON rest.id = b.restaurant_id
        WHERE r.id = $1 AND rest.approval_status = 'approved'
        RETURNING id, review_id, user_id, content, created_at
        `,
        [reviewId, userId, content]
    );
};

const toggleVouchService = async ({ reviewId, userId }) => {
    return db.tx(async (transaction) => {
        const review = await transaction.oneOrNone(
            `
            SELECT r.id
            FROM review r
            INNER JOIN branches b ON b.id = r.branch_id
            INNER JOIN restaurants rest ON rest.id = b.restaurant_id
            WHERE r.id = $1 AND rest.approval_status = 'approved'
            FOR UPDATE OF r
            `,
            [reviewId]
        );

        if (!review) return null;

        const removed = await transaction.oneOrNone(
            `
            DELETE FROM vouch
            WHERE user_id = $1 AND review_id = $2
            RETURNING id
            `,
            [userId, reviewId]
        );

        let vouched = false;

        if (!removed) {
            await transaction.none(
                `INSERT INTO vouch (user_id, review_id) VALUES ($1, $2)`,
                [userId, reviewId]
            );
            vouched = true;
        }

        const count = await transaction.one(
            `SELECT COUNT(*)::int AS value FROM vouch WHERE review_id = $1`,
            [reviewId]
        );

        await transaction.none(
            `UPDATE review SET vouch_count = $1 WHERE id = $2`,
            [count.value, reviewId]
        );

        return { vouched, vouchCount: count.value };
    });
};

module.exports = {
    createReviewService,
    listReviewsService,
    listCommentsService,
    createCommentService,
    toggleVouchService,
};
