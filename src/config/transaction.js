const { db } = require('./dbConfig');

const withExplicitTransaction = async (operation) => {
    return db.task(async (connection) => {
        await connection.none('BEGIN');

        try {
            const result = await operation(connection);
            await connection.none('COMMIT');
            return result;
        } catch (error) {
            try {
                await connection.none('ROLLBACK');
            } catch (rollbackError) {
                error.rollbackError = rollbackError;
            }

            throw error;
        }
    });
};

module.exports = { withExplicitTransaction };
