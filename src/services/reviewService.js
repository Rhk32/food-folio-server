const { db } = require('../config/dbConfig');
const { withExplicitTransaction } = require('../config/transaction');

const createReviewService = async ({ userId, branchId, rating, content, imageUrls }) => {
    return withExplicitTransaction(async (transaction) => {
        const procedureResult = await transaction.one(
            `
            CALL public.create_review_with_images(
                $1::uuid,
                $2::uuid,
                $3::integer,
                $4::text,
                $5::text[],
                $6::text,
                $7::uuid
            )
            `,
            [userId, branchId, rating, content, imageUrls, null, null]
        );

        if (procedureResult.p_status !== 'created' || !procedureResult.p_review_id) {
            return null;
        }

        const review = await transaction.one(
            `
            SELECT *
            FROM public.review
            WHERE id = $1
            `,
            [procedureResult.p_review_id]
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
    return withExplicitTransaction(async (transaction) => {
        const procedureResult = await transaction.one(
            `
            CALL public.toggle_review_vouch(
                $1::uuid,
                $2::uuid,
                $3::text,
                $4::boolean,
                $5::bigint
            )
            `,
            [userId, reviewId, null, null, null]
        );

        if (procedureResult.p_status !== 'updated') return null;

        return {
            vouched: procedureResult.p_vouched,
            vouchCount: Number(procedureResult.p_vouch_count),
        };
    });
};

const deleteReviewByManagerService = async ({ reviewId, userId }) => {
    return withExplicitTransaction(async (transaction) => {
        const procedureResult = await transaction.one(
            `
            CALL public.delete_review_as_manager(
                $1::uuid,
                $2::uuid,
                $3::text,
                $4::uuid
            )
            `,
            [userId, reviewId, null, null]
        );

        return {
            status: procedureResult.p_status,
            ...(procedureResult.p_deleted_review_id
                ? { reviewId: procedureResult.p_deleted_review_id }
                : {}),
        };
    });
};

module.exports = {
    createReviewService,
    listReviewsService,
    listCommentsService,
    createCommentService,
    toggleVouchService,
    deleteReviewByManagerService,
};
