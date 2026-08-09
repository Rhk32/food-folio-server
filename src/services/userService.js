const { db } = require("../config/dbConfig");

const getUserById = async (id) => {
    return await db.oneOrNone(`
        SELECT
            id,
            created_at,
            name,
            email,
            profile_picture_url,
            current_city,
            current_country,
            role
        FROM users
        WHERE id = $1
        `,
        [id]
    );
};

module.exports = { getUserById };
