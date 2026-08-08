const { searchUserByEmail, createUser } = require('../services/authService');

const userSignUp = async (req, res) => {
    try {
        const userData = req.body;

        const existingUser = await searchUserByEmail(userData.email);

        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }

        const response = await createUser(userData);

        res.status(201).json(response);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

module.exports = { userSignUp };