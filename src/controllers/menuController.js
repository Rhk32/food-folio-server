const { getMenuItemsByBranchIdService, createMenuItemService } = require("../services/menuService");
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

module.exports = { getMenuItemsByBranchId, createMenuItem };