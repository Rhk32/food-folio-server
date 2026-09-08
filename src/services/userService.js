const { db } = require("../config/dbConfig");
const { checkPassword } = require("./authService");
const bcrypt = require('bcryptjs');

const getUserById = async (id) => {
    return await db.oneOrNone(`
        SELECT
            id,
            password,
            created_at,
            name,
            email,
            profile_picture_url,
            current_city,
            current_country,
            role,
            bio
        FROM users
        WHERE id = $1
        `,
        [id]
    );
};

const updateUserProfileInDb = async (userId, fieldsToUpdate) => {
    const { name, bio, current_city, current_country } = fieldsToUpdate;

    return await db.oneOrNone(`
        UPDATE public.users
        SET 
            name = $/name/,
            bio = $/bio/,
            current_city = $/current_city/,
            current_country = $/current_country/
        WHERE id = $/userId/
        RETURNING 
            id,
            created_at,
            name,
            email,
            profile_picture_url,
            current_city,
            current_country,
            role,
            bio
    `, {
        name,
        bio,
        current_city,
        current_country,
        userId
    });
};

const updatePasswordService = async (userId, oldPassword, newPassword) => {
    const user = await getUserById(userId);

    if (!user) {
        throw new Error('User not found.');
    }

    const isPasswordValid = await checkPassword(oldPassword, user.password)
    if (!isPasswordValid) {
        throw new Error('Incorrect current password.');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.none('UPDATE users SET password = $1 WHERE id = $2', [newPasswordHash, userId]);

    return { message: 'Password updated successfully.' };
};

module.exports = { getUserById, updateUserProfileInDb, updatePasswordService };
