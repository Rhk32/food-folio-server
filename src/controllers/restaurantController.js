const { getUserRestaurantsByUserID, postRestaurantByUserIdAndRestaurantManager, getUnapprovedRestaurantsService, updateRestaurantApprovalService, getRestaurantByRestaurantIdService, checkRestaurantManagerService } = require("../services/restaurantService");

const getUserRestaurants = async (req, res) => {
    try {
        const userId = req.user.userId;
        // console.log(userId);

        if (!userId) {
            return res.status(400).json({
                message: "Invalid User ID",
            });
        }

        const restaurants = await getUserRestaurantsByUserID(userId);

        return res.status(200).json({ restaurants });
    } catch (error) {
        console.error("Error getting user restaurants:", error);

        return res.status(500).json({
            message: "Failed to find restaurants",
        });
    }
};

const createRestaurant = async (req, res) => {
    try {
        const userId = req.user.userId;

        // console.log(logo_url.length);
        // console.log(req.body);
        if (req.body.logo_url.length === 0) {
            // logo_url = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0';
            req.body.logo_url = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0';
        }
        const { name, description, logo_url } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Restaurant name is required'
            });
        }

        // console.log(req.body);
        const restaurant = await postRestaurantByUserIdAndRestaurantManager(userId, name, description, logo_url);

        return res.status(201).json({
            message: 'Restaurant created successfully',
            // restaurant
        });
    } catch (error) {
        console.error('Error creating restaurant:', error);

        return res.status(500).json({
            message: 'Failed to create restaurant'
        });
    }
};

const getUnapprovedRestaurants = async (req, res) => {
    try {
        const restaurants = await getUnapprovedRestaurantsService();

        return res.status(200).json({
            restaurants
        });
    } catch (error) {
        console.error('Error getting unapproved restaurants:', error);

        return res.status(500).json({
            message: 'Failed to fetch unapproved restaurants'
        });
    }
};

const updateRestaurantApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { approval_status } = req.body;

        const allowedStatuses = [
            'pending',
            'approved',
            'rejected'
        ];

        if (!allowedStatuses.includes(approval_status)) {
            return res.status(400).json({
                message: 'Invalid approval status'
            });
        }

        const restaurant = await updateRestaurantApprovalService(
            id,
            approval_status
        );

        if (!restaurant) {
            return res.status(404).json({
                message: 'Restaurant not found'
            });
        }

        return res.status(200).json({
            message: `Restaurant ${approval_status} successfully`,
            restaurant
        });

    } catch (error) {
        console.error(
            'Error updating restaurant approval:',
            error
        );

        return res.status(500).json({
            message: 'Failed to update restaurant approval status'
        });
    }
};

const getRestaurantByRestaurantId = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userId = req.user.userId;

        if (!restaurantId) {
            return res.status(400).json({
                message: 'Restaurant ID is required',
            });
        }

        const isManager = await checkRestaurantManagerService(userId, restaurantId);

        if (!isManager) {
            return res.status(403).json({
                message: 'You do not have access to this restaurant',
            });
        }

        const restaurant =
            await getRestaurantByRestaurantIdService(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                message: 'Restaurant not found',
            });
        }

        return res.status(200).json({
            restaurant,
        });
    } catch (error) {
        console.error(
            'Error in getRestaurantByRestaurantId controller:',
            error
        );

        return res.status(500).json({
            message: 'Failed to fetch restaurant',
        });
    }
};

module.exports = { getUserRestaurants, createRestaurant, getUnapprovedRestaurants, updateRestaurantApproval, getRestaurantByRestaurantId };