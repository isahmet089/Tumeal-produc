const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: Number, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    action: { type: String, required: true }, // Yapılan işlemin açıklaması
    details: { type: String, required: false }, // Yapılan işlemin detayları

}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);