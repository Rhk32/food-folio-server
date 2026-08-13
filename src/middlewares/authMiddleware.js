const { jwtVerify } = require("jose");


const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log(authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];
        // console.log(token);

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        req.user = payload;
        // console.log(payload);

        next();
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};

module.exports = { authenticateUser };