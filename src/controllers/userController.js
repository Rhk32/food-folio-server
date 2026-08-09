const { getUserById } = require("../services/userService");

const getCurrentUser = async (req, res) => {
    try {
        const user = await getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        return res.status(200).json({
            user
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

module.exports = { getCurrentUser };