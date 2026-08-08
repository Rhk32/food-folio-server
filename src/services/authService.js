const bcrypt = require('bcryptjs');
const { db } = require('../config/dbConfig');

const searchUserByEmail = async (email) => {
    return db.oneOrNone(`
        SELECT id, name, email, password
        FROM users
        WHERE email = $1
        `,
        [email]
    );
};

const createUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(userData.password, salt);
    console.log(userData);
    console.log(hashPassword);
    return {
        message: 'Success'
    };
};

module.exports = { searchUserByEmail, createUser };