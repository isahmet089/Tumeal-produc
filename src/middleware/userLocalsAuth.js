// src/middleware/userLocalsAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { accessToken } = require('../config/jwtConfig'); // JWT config'i import et

const userLocals = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if (token) {
            const decoded = jwt.verify(token, accessToken.secret); // JWT_SECRET yerine accessToken.secret kullan
      

            const user = await User.findById(decoded.id).select('-password');
         

            res.locals.user = user;
        } else {
            res.locals.user = null;
        }
    } catch (error) {
        console.error('UserLocals Error:', error); // Debug için
        res.locals.user = null;
    }
    next();
};

module.exports = userLocals;