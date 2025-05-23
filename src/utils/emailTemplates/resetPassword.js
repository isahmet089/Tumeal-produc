// src/utils/emailTemplates/resetPassword.js
const resetPasswordTemplate = (user, resetUrl) => {
    return `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Şifre Sıfırlama</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              border: 1px solid #e1e1e1;
              border-radius: 5px;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #ff6b35;
              color: white;
              padding: 10px 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              text-align: center;
              color: #666;
            }
            .button {
              display: inline-block;
              background-color: #ff6b35;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 15px;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 10px;
              border-radius: 5px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Şifre Sıfırlama</h1>
            </div>
            
            <p>Merhaba ${user.firstName},</p>
            
            <p>TuMeal hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
            </div>

            <div class="warning">
              <p><strong>Önemli:</strong> Bu bağlantı 15 dakika süreyle geçerlidir.</p>
              <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, lütfen bu e-postayı dikkate almayın ve hesabınızın güvenliği için şifrenizi değiştirmeyi düşünün.</p>
            </div>
            
            <p>Güvenliğiniz için şifrenizi kimseyle paylaşmayın ve düzenli olarak değiştirmeyi unutmayın.</p>
            
            <div class="footer">
              <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
              <p>&copy; ${new Date().getFullYear()} TuMeal. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
    `;
};

module.exports = resetPasswordTemplate; 