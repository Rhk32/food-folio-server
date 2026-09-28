const feedService = require('../services/feedService');

const getFeedData = async (req, res) => {
    try {
        const { lat, lng, city, radius, search = '' } = req.query;
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const radiusKm = Math.min(50, Math.max(1, Number.parseInt(radius, 10) || 10));
        const radiusMeters = radiusKm * 1000;
        const limit = 10;

        let result;

        // if location access given
        if (lat && lng) {
            const numericLat = Number(lat);
            const numericLng = Number(lng);

            if (!Number.isFinite(numericLat) || !Number.isFinite(numericLng)) {
                return res.status(400).json({ message: 'Invalid coordinates' });
            }

            result = await feedService.getReviewsByRadius({
                lat: numericLat,
                lng: numericLng,
                radius: radiusMeters,
                search: String(search).trim(),
                page,
                limit,
                viewerId: req.user?.userId,
            });
        } 
        // if no location given
        else if (city) {
            result = await feedService.getReviewsByCity({
                city: String(city).trim(),
                search: String(search).trim(),
                page,
                limit,
                viewerId: req.user?.userId,
            });
        } 
        else {
            return res.status(400).json({ message: "Location parameters are missing!" });
        }

        return res.status(200).json({
            success: true,
            data: result.items,
            totalFound: result.total,
            currentPage: page,
            limit,
        });

    } catch (error) {
        console.error("Feed Controller Error:", error);
        return res.status(500).json({ message: "Server error while fetching feed." });
    }
};

module.exports = { getFeedData };
