const { getUserRestaurantsByUserID, postRestaurantByUserIdAndRestaurantManager } = require("../services/restaurantService");

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

module.exports = { getUserRestaurants, createRestaurant };