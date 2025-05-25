const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // Kişisel Bilgiler
    firstName: {
        type: String,
        required: [true, 'Ad alanı zorunludur'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Soyad alanı zorunludur'],
        trim: true
    },
    studentId: {
        type: String,
        required: [true, 'Öğrenci numarası zorunludur'],
        unique: true,
        trim: true
    },

    // Hesap Bilgileri
    email: {
        type: String,
        required: [true, 'E-posta adresi zorunludur'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Şifre zorunludur'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır']
    },

    // Hesap Durumu
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,

    // Kullanım Koşulları
    termsAccepted: {
        type: Boolean,
        required: true,
        default: false
    },
    lastActiveAt: { type: Date, default: Date.now }
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

const User = mongoose.model("User", userSchema);

module.exports = User;