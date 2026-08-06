const serverHealthService = require('../services/serverHealthService');

const getHealthStatus = (req, res) => {
    try {
        const message = serverHealthService.getHealthStatus();

        res.json(message);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: '❌Server is not healthy!'
        });
    }
};

module.exports = { getHealthStatus };