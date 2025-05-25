const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    count: {
        type: Number,
        default: 1
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Hashtag', hashtagSchema);