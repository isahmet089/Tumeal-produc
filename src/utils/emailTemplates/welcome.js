const adminNotificationTemplate = (user) => {
    return `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Yeni Kullanıcı Kaydı</title>
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
              background-color: #2a3f5f;
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
            .user-details {
              background-color: #f0f0f0;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .button {
              display: inline-block;
              background-color: #2a3f5f;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Yeni Kullanıcı Kaydı</h1>
            </div>
            
            <p>Merhaba ${user.firstName},</p>
            
            <p>Platformunuza yeni bir kullanıcı kaydoldu. Kullanıcı detayları aşağıdadır:</p>
            
            <div class="user-details">
              <p><strong>İsim:</strong> ${user.firstName || "Belirtilmemiş"}</p>
              <p><strong>E-posta:</strong> ${user.email}</p>
              <p><strong>Kayıt Tarihi:</strong> ${new Date(
                user.createdAt
              ).toLocaleString("tr-TR")}</p>
            </div>
            
            <p>Yönetici panelinden daha fazla bilgiye erişebilirsiniz.</p>
            
            <a href="#" class="button">Yönetici Paneline Git</a>
            
            <div class="footer">
              <p>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayınız.</p>
              <p>&copy; ${new Date().getFullYear()} Uygulama Adı. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  };
  
  module.exports = adminNotificationTemplate;
  