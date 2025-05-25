const Log = require('../models/Log');

const logMiddleware = (req, res, next) => {
    // Sadece POST isteklerini logla
    if (req.method !== 'POST') {
        return next();
    }

    // Kullanıcı kontrolü
    if (!res.locals.user) {
        return next();
    }

    const user = res.locals.user;
    console.log('Log middleware çalıştı - Kullanıcı:', user._id);

    // İşlem açıklamasını belirle
    let action = '';
    let details = null;

    // POST isteklerine göre işlem açıklaması
    switch (req.originalUrl) {
        case '/add-comment':
            action = 'Yorum eklendi';
            break;
        case '/like-post':
            action = 'Post beğenildi';
            
            break;
        case '/create-post':
            action = 'Yeni post oluşturuldu';
            break;
        case '/toggle-favorite':
            action = 'Favori durumu değiştirildi';
            break;
        default:
            action = 'POST isteği yapıldı';
    }

    // Response tamamlandığında log kaydı oluştur
    res.on('finish', async () => {
        try {
            // Sadece başarılı işlemleri logla (200-299 arası status kodları)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const logData = {
                    user: user._id,
                    method: req.method,
                    url: req.originalUrl,
                    status: res.statusCode,
                    ip: req.ip,
                    userAgent: req.headers['user-agent'],
                    action: action,
                    details: details
                };

                console.log('Log kaydı oluşturuluyor:', logData);
                await Log.create(logData);
                console.log('Log kaydı başarıyla oluşturuldu');
            }
        } catch (err) {
            console.error('Log kaydı hatası:', err);
        }
    });

    next();
};

module.exports = logMiddleware;