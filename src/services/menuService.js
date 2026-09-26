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

const createMenuItemService = async ({ branchId, name, description, price }) => {
    try {
        const menuItem = await db.one(
            `
            INSERT INTO menu_item (
                branch_id,
                name,
                description,
                price
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                branchId,
                name,
                description,
                price,
            ]
        );

        return menuItem;
    } catch (error) {
        console.error(
            'Error creating menu item:',
            error
        );

        throw error;
    }
};

module.exports = { getMenuItemsByBranchIdService, createMenuItemService };