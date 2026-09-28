const { getMenuItemsByBranchIdService, createMenuItemService, getMenuItemByMenuItemIdService, updateMenuItemService } = require("../services/menuService");
const { checkRestaurantManagerByBranchIdService } = require("../services/restaurantService");

const getMenuItemsByBranchId = async (req, res) => {
    try {
        const { branchId } = req.params;

        if (!branchId) {
            return res.status(400).json({
                message: 'Branch ID is required',
            });
        }

        const menuItems = await getMenuItemsByBranchIdService(branchId);

        return res.status(200).json({
            menuItems,
        });
    } catch (error) {
        console.error('Error in getMenuItemsByBranchId:', error);

        return res.status(500).json({
            message: 'Failed to fetch menu items',
        });
    }
};

const createMenuItem = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { branch_id, name, description, price } = req.body;

        if (!branch_id) {
            return res.status(400).json({
                message: 'Branch ID is required',
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Menu item name is required',
            });
        }

        if (price === undefined || price === null || price === '') {
            return res.status(400).json({
                message: 'Menu item price is required',
            });
        }

        const numericPrice = Number(price);

        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                message: 'Invalid menu item price',
            });
        }

        const isManager = await checkRestaurantManagerByBranchIdService(userId, branch_id);

        if (!isManager) {
            return res.status(403).json({
                message: 'You do not have access to this branch',
            });
        }

        const menuItem = await createMenuItemService({
            branchId: branch_id,
            name: name.trim(),
            description: description?.trim() || null,
            price: numericPrice,
        });

        return res.status(201).json({
            message: 'Menu item created successfully',
            menuItem,
        });
    } catch (error) {
        console.error(
            'Error in createMenuItem:',
            error
        );

        return res.status(500).json({
            message: 'Failed to create menu item',
        });
    }
};

const getMenuItemByMenuItemId = async (req, res) => {
    try {
        const { menuItemId } = req.params;

        if (!menuItemId) {
            return res.status(400).json({
                message: 'Menu item ID is required',
            });
        }

        const menuItem =
            await getMenuItemByMenuItemIdService(menuItemId);

        if (!menuItem) {
            return res.status(404).json({
                message: 'Menu item not found',
            });
        }

        return res.status(200).json({
            menuItem,
        });
    } catch (error) {
        console.error(
            'Error in getMenuItemByMenuItemId:',
            error
        );

        return res.status(500).json({
            message: 'Failed to fetch menu item',
        });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { menuItemId } = req.params;
        const { name, description, price } = req.body;

        if (!menuItemId) {
            return res.status(400).json({
                message: 'Menu item ID is required',
            });
        }

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                message: 'Menu item name is required',
            });
        }

        if (
            price === undefined ||
            price === null ||
            price === ''
        ) {
            return res.status(400).json({
                message: 'Menu item price is required',
            });
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                message: 'Invalid menu item price',
            });
        }

        const existingMenuItem = await getMenuItemByMenuItemIdService(menuItemId);

        if (!existingMenuItem) {
            return res.status(404).json({
                message: 'Menu item not found',
            });
        }

        const isManager = await checkRestaurantManagerByBranchIdService(userId, existingMenuItem.branch_id);

        if (!isManager) {
            return res.status(403).json({
                message: 'You do not have permission to edit this menu item',
            });
        }

        const menuItem = await updateMenuItemService(
            menuItemId,
            {
                name: name.trim(),
                description:
                    typeof description === 'string'
                        ? description.trim() || null
                        : null,
                price: numericPrice,
            }
        );

        if (!menuItem) {
            return res.status(404).json({
                message: 'Menu item not found',
            });
        }

        return res.status(200).json({
            message: 'Menu item updated successfully',
            menuItem,
        });
    } catch (error) {
        console.error('Error in updateMenuItem:', error);

        return res.status(500).json({
            message: 'Failed to update menu item',
        });
    }
};

module.exports = { getMenuItemsByBranchId, createMenuItem, getMenuItemByMenuItemId, updateMenuItem };