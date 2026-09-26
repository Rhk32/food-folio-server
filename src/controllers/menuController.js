const { getMenuItemsByBranchIdService } = require("../services/menuService");

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

module.exports = { getMenuItemsByBranchId };