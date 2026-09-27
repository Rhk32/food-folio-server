const feedService = require('../services/feedService');

const getFeedData = async (req, res) => {
    try {
        const { lat, lng, city, country, radius, search, page = 1} = req.query;
        const rad = (parseInt(radius) || 10) * 1000;
        const limit = 5;

        let reviews = [];

        // if location access given
        if (lat && lng) {
            reviews = await feedService.getReviewsByRadius(lat, lng, rad, search, parseInt(page), limit);
        } 
        // if no location given
        else if (city) {
            reviews = await feedService.getReviewsByCity(city, search, parseInt(page), limit);
        } 
        else {
            return res.status(400).json({ message: "Location parameters are missing!" });
        }

        const totalFound = reviews.length > 0 ? parseInt(reviews[0].total_count) : 0;

        return res.status(200).json({
            success: true,
            data: reviews,
            totalFound: totalFound,
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error("Feed Controller Error:", error);
        return res.status(500).json({ message: "Server error while fetching feed." });
    }
};

module.exports = { getFeedData };