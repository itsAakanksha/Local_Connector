const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes middleware
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (excluding password)
            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized - user not found'
                });
            }

            if (!req.user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized - invalid token'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized - no token provided'
        });
    }
};

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

module.exports = {
    protect,
    generateToken
};