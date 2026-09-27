const { getCuisinesByRestaurantIdService } = require("../services/cuisineService");

const getCuisinesByRestaurantId = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        if (!restaurantId) {
            return res.status(400).json({
                message: 'Restaurant ID is required',
            });
        }

        const cuisines = await getCuisinesByRestaurantIdService(restaurantId);

        return res.status(200).json({ cuisines });
    } catch (error) {
        console.error('Error in getCuisinesByRestaurantId:', error);

        return res.status(500).json({
            message: 'Failed to fetch restaurant cuisines',
        });
    }
};

module.exports = { getCuisinesByRestaurantId };