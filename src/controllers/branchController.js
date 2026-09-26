const { parseGoogleMapsUrl, unfurlGoogleMapsUrl } = require("google-maps-link-parser");
const { getBranchesByRestaurantIdService, createBranchService } = require("../services/branchService");
const { checkRestaurantManagerService } = require("../services/restaurantService");

const getBranchesByRestaurantId = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const userId = req.user.userId;

        if (!restaurantId) {
            return res.status(400).json({
                message: 'Restaurant ID is required',
            });
        }

        // Check whether the authenticated user manages this restaurant
        const isManager = await checkRestaurantManagerService(userId, restaurantId);

        if (!isManager) {
            return res.status(403).json({
                message: 'You do not have access to this restaurant',
            });
        }

        const branches = await getBranchesByRestaurantIdService(restaurantId);

        return res.status(200).json({
            branches,
        });
    } catch (error) {
        console.error('Error in getBranchesByRestaurantId:', error);

        return res.status(500).json({
            message: 'Failed to fetch branches',
        });
    }
};

const createBranch = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { restaurant_id, branch_name, address, city, google_maps_url } = req.body;

        if (!restaurant_id) {
            return res.status(400).json({
                message: 'Restaurant ID is required',
            });
        }

        if (!branch_name || !address || !city || !google_maps_url) {
            return res.status(400).json({
                message: 'Branch name, address, city and Google Maps URL are required',
            });
        }

        // 1. Check that this user manages this restaurant
        const isManager = await checkRestaurantManagerService(userId, restaurant_id);

        if (!isManager) {
            return res.status(403).json({
                message: 'You do not have access to this restaurant',
            });
        }

        // 2. First try parsing the URL directly
        let parsed = parseGoogleMapsUrl(google_maps_url);

        let coordinates = parsed.location?.value;

        // 3. If no coordinates, resolve the short URL
        if (!coordinates) {
            const unfurled = await unfurlGoogleMapsUrl(google_maps_url);

            if (unfurled.resolution?.status !== 'resolved') {
                return res.status(400).json({
                    message: 'Could not resolve Google Maps URL',
                });
            }

            // 4. Parse the resolved full URL
            parsed = parseGoogleMapsUrl(
                unfurled.resolution.resolvedUrl
            );

            coordinates = parsed.location?.value;
        }

        // 5. Make sure coordinates were found
        if (!coordinates) {
            return res.status(400).json({
                message:
                    'Could not extract coordinates from Google Maps URL',
            });
        }

        const {
            latitude,
            longitude,
        } = coordinates;

        if (
            typeof latitude !== 'number' ||
            typeof longitude !== 'number'
        ) {
            return res.status(400).json({
                message: 'Invalid coordinates from Google Maps URL',
            });
        }

        // 6. Save branch
        const branch = await createBranchService({ restaurantId: restaurant_id, branchName: branch_name, address, city, latitude, longitude, googleMapsUrl: google_maps_url });

        return res.status(201).json({
            message: 'Branch created successfully',
            branch,
        });
    } catch (error) {
        console.error('Error in createBranch:', error);

        return res.status(500).json({
            message: 'Failed to create branch',
        });
    }
};

module.exports = { getBranchesByRestaurantId, createBranch };