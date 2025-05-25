// src/middleware/updateLastActive.js
const User = require('../models/User');

const updateLastActive = async (req, res, next) => {
    if (res.locals.user) {
        console.log(res.locals.user);
        await User.findByIdAndUpdate(res.locals.user._id, { lastActiveAt: new Date() });
    }
    next();
};

module.exports = updateLastActive;