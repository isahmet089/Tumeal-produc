const { createTransporter } = require("../config/mailConfig");
const welcomeEmailTemplate = require("./emailTemplates/welcome");
const verificationTemplate = require("./emailTemplates/verification");
const resetPasswordTemplate = require("./emailTemplates/resetPassword");
class EmailService {
  static async sendWelcomeEmail(user) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Tumeal-education-platform" <${
          process.env.EPOSTA || "<tumeal@outlook.com.tr>"
        }>`,
        to: user.email,
        subject: "Hoş Geldiniz! Kaydınız Başarıyla Tamamlandı",
        html: welcomeEmailTemplate(user),
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Hoş geldiniz e-postası gönderildi:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Hoş geldiniz e-postası gönderilirken hata oluştu:", error);
      return { success: false, error: error.message };
    }
  }


static async sendVerificationEmail(user, token) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  console.log(verificationUrl);
  try {
      const transporter = createTransporter();
      const mailOptions = {
          from: `"TuMeal" <${process.env.EPOSTA || "tumeal@outlook.com.tr"}>`,
          to: user.email,
          subject: "Hesabınızı Doğrulayın | TuMeal",
          html: verificationTemplate(user, verificationUrl)
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Doğrulama e-postası gönderildi:", info.messageId);
      return { success: true, messageId: info.messageId };
  } catch (error) {
      console.error("Doğrulama e-postası gönderilirken hata oluştu:", error);
      return { success: false, error: error.message };
  }
}

  static async sendResetPasswordEmail(user, token) {
    const resetPasswordUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    if (!resetPasswordUrl) {
      return { success: false, error: "Reset password token is not provided" };
    }
    try {
      const transporter = createTransporter();
      const mailOptions = {
        from: `"ONLINE-education-platform" <${
          process.env.EPOSTA || "<tumeal@outlook.com.tr>"
        }>`,
        to: user.email,
        subject: "Şifre Sıfırlama Talebi",
        html: resetPasswordTemplate(user, resetPasswordUrl),
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Şifre sıfırlama e-postası gönderildi:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Şifre sıfırlama e-postası gönderilirken hata oluştu:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
