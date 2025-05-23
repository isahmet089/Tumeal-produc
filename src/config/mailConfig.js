const nodemailer = require("nodemailer");
require("dotenv").config();
// Nodemailer transport oluşturucu
const createTransporter = () => {
  // SMTP yapılandırması - gerçek bir email servisi kullanılmalıdır
  // Not: Gerçek projede bu bilgiler .env dosyasından alınmalıdır
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE === "true" , // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_EPOSTA, // brevo hesabı
      pass: process.env.BREVO_SIFRE, // brevo app şifresi
    },
  });
};

module.exports = {
  createTransporter,

};
