const bcrypt = require('bcryptjs');
const { db } = require('../config/dbConfig');
const { SignJWT } = require('jose');

const searchUserByEmail = async (email) => {
    return db.oneOrNone(`
        SELECT id, password
        FROM users
        WHERE email = $1
        `,
        [email]
    );
};

const createUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(userData.password, salt);

    await db.none(
        `
        INSERT INTO users (
            name,
            email,
            profile_picture_url,
            current_city,
            current_country,
            location,
            password
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            ST_SetSRID(
                ST_MakePoint($6, $7),
                4326
            ),
            $8
        )
        `,
        [
            userData.name,
            userData.email,
            userData.profile_picture_url,
            userData.current_city,
            userData.current_country,
            userData.longitude,
            userData.latitude,
            hashPassword
        ]
    );
};

const checkPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const createToken = async (user) => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    // console.log(secret);

    const token = await new SignJWT({
        userId: user.id
    })
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret);

    return token;
};

module.exports = { searchUserByEmail, createUser, checkPassword, createToken };
