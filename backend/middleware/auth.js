const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify if user is authenticated
const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Not authorized to access this route' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            error: 'Not authorized to access this route' 
        });
    }
};

// Check if user is admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false,
            error: 'Not authorized as admin' 
        });
    }
};

module.exports = { protect, admin };