const { searchUserByEmail, createUser, checkPassword, createToken } = require('../services/authService');

const userSignUp = async (req, res) => {
    try {
        const userData = req.body;

        const existingUser = await searchUserByEmail(userData.email);
        
        if (existingUser) {
            return res.status(409).json({
                message: 'User already exists'
            });
        }
        
        await createUser(userData);
        
        res.status(201).json({ message: 'User created successfully' });
        
    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

const userLogIn = async (req, res) => {
    try {
        const data = req.body;
        // console.log(data);
        
        const existingUser = await searchUserByEmail(data.email);
        
        if (!existingUser) {
            return res.status(401).json({
                message: 'User does not exist'
            });
        }

        const isMatched = await checkPassword(data.password, existingUser.password);

        if (isMatched) {
            const token = await createToken(existingUser);
            // console.log(token);

            return res.status(200).json({
                message: 'Login Succesful',
                token
            });
        } else {
            return res.status(401).json({
                message: 'Password does not match'
            });
        }

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: 'Something went wrong'
        });
    }
};

module.exports = { userSignUp, userLogIn };