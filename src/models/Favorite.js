const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true
    }
}, {
    timestamps: true
});

// Aynı kullanıcı ve menü kombinasyonunun tekrar eklenmesini engelle
favoriteSchema.index({ user: 1, meal: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);