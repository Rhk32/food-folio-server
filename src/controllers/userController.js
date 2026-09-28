const { getUserById, updateUserProfileInDb, updatePasswordService } = require("../services/userService");

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

const getProfileDisplayUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        // console.log(userId);

        const user = await getUserById(userId);
        // console.log(user);

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

const updateProfileBasicInformation = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, bio, current_city, current_country } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID missing from request.' });
        }

        const updatedUser = await updateUserProfileInDb(userId, {
            name,
            bio,
            current_city,
            current_country
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Update failed.' });
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const userId = req?.user?.userId;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const result = await updatePasswordService(userId, oldPassword, newPassword);

        // console.log("success");
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error('Password update error:', error.message);
        return res.status(400).json({ success: false, message: error.message || 'Failed to update password.' });
    }
};

module.exports = { getCurrentUser, getProfileDisplayUserById, updateProfileBasicInformation, updatePassword };