const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true }, // info, success, warning, error, menu, announcement
    notificationType: { type: String, required: true }, // 'app' veya 'meal'
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);