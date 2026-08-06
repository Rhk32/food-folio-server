require('dotenv').config();
const pgp = require('pg-promise')();
const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

const testConnection = async () => {
    try {
        const res = await db.one('SELECT NOW() AS now');
        console.log(`Database Connected ${res.now}`);
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

module.exports = { db, pgp, testConnection };