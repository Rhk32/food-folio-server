const { db } = require("../config/dbConfig");

const getMenuItemsByBranchIdService = async (branchId) => {
    try {
        const menuItems = await db.manyOrNone(
            `
            SELECT
                id,
                branch_id,
                name,
                description,
                price
            FROM menu_item
            WHERE branch_id = $1
            ORDER BY name ASC
            `,
            [branchId]
        );

        return menuItems;
    } catch (error) {
        console.error(
            'Error fetching menu items:',
            error
        );

        throw error;
    }
};

module.exports = { getMenuItemsByBranchIdService };