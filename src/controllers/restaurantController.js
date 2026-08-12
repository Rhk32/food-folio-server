const { getUserRestaurantsByUserID } = require("../services/restaurantService");

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

module.exports = { getUserRestaurants };