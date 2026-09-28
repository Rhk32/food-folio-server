const searchService = require('../services/searchService');

const parsePage = (value) => Math.max(1, Number.parseInt(value, 10) || 1);
const SEARCH_LIMIT = 12;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const search = async (req, res) => {
    try {
        const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
        const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
        const cuisineId = typeof req.query.cuisineId === 'string' && req.query.cuisineId
            ? req.query.cuisineId
            : null;

        if (cuisineId && !UUID_PATTERN.test(cuisineId)) {
            return res.status(400).json({ message: 'Invalid cuisine filter' });
        }
        const userPage = parsePage(req.query.userPage);
        const restaurantPage = parsePage(req.query.restaurantPage);

        const [users, restaurants] = await Promise.all([
            searchService.searchUsers({ query, page: userPage, limit: SEARCH_LIMIT }),
            searchService.searchRestaurants({
                query,
                city,
                cuisineId,
                page: restaurantPage,
                limit: SEARCH_LIMIT,
            }),
        ]);

        return res.status(200).json({
            users: {
                items: users.map(({ total_count, ...user }) => user),
                total: users[0]?.total_count ?? 0,
                page: userPage,
                limit: SEARCH_LIMIT,
            },
            restaurants: {
                items: restaurants.map(({ total_count, ...restaurant }) => restaurant),
                total: restaurants[0]?.total_count ?? 0,
                page: restaurantPage,
                limit: SEARCH_LIMIT,
            },
        });
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ message: 'Failed to search Food Folio' });
    }
};

const getFilters = async (req, res) => {
    try {
        return res.status(200).json(await searchService.getSearchFilters());
    } catch (error) {
        console.error('Search filter error:', error);
        return res.status(500).json({ message: 'Failed to load search filters' });
    }
};

module.exports = { search, getFilters };
