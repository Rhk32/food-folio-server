const { db } = require('../config/dbConfig');

const getHealthStatus = () => {
    return {meassge: '✅Server up and running!'};
};

module.exports = { getHealthStatus };