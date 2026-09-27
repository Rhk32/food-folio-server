const { getCuisinesByRestaurantIdService, postCuisineByRestaurantIdService } = require("../services/cuisineService");
const { checkRestaurantManagerService } = require("../services/restaurantService");

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

const postCuisineByRestaurantId = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { restaurantId } = req.params;
        const { name } = req.body;

        if (!restaurantId) {
            return res.status(400).json({
                message: 'Restaurant ID is required',
            });
        }

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurantId)) {
            return res.status(400).json({
                message: 'Invalid restaurant ID',
            });
        }

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                message: 'Cuisine name is required',
            });
        }

        const isManager = await checkRestaurantManagerService(userId, restaurantId);

        if (!isManager) {
            return res.status(403).json({
                message: 'You do not have permission to add cuisines to this restaurant',
            });
        }

        const result = await postCuisineByRestaurantIdService(restaurantId, name.trim());

        if (result.status === 'not_found') {
            return res.status(404).json({
                message: 'Cuisine not found',
            });
        }

        if (result.status === 'already_exists') {
            return res.status(409).json({
                message: 'This cuisine is already associated with the restaurant',
            });
        }

        return res.status(201).json({
            message: 'Cuisine added to restaurant successfully',
            restaurantCuisine: result.restaurantCuisine,
        });
    } catch (error) {
        console.error('Error in postCuisineByRestaurantId:', error);

        return res.status(500).json({
            message: 'Failed to add cuisine to restaurant',
        });
    }
};

module.exports = { getCuisinesByRestaurantId, postCuisineByRestaurantId };