
const HTTP_CODES = {
    OK: 200,                 // İstek başarılı oldu. Genellikle GET isteklerinde veri döndürülürken kullanılır.
    CREATED: 201,            // İstek başarılı oldu ve yeni bir kaynak oluşturuldu. Genellikle POST isteklerinde kullanılır.
    NO_CONTENT: 204,         // İstek başarılı oldu ancak döndürülecek bir içerik yok. Genellikle DELETE isteklerinde kullanılır.
    NOT_MODIFIED: 304,       // Kaynak değiştirilmedi. Genellikle önbellekleme senaryolarında kullanılır.
    BAD_REQUEST: 400,        // Sunucu, geçersiz istek sözdizimi nedeniyle isteği işleyemedi. Örneğin, eksik veya hatalı parametreler.
    UNAUTHORIZED: 401,       // İstek yetkilendirme gerektiriyor. Kullanıcı kimliği doğrulanmamış.
    FORBIDDEN: 403,          // Sunucu isteği anladı ancak yetkilendirme reddedildi. Kullanıcının kaynağa erişim izni yok.
    NOT_FOUND: 404,          // Sunucu, istenen kaynağı bulamadı.
    METHOD_NOT_ALLOWED: 405, // İstenen kaynak için bu HTTP metodu desteklenmiyor. Örneğin, bir salt okunur kaynağa POST isteği yapmak.
    NOT_ACCEPTABLE: 406,     // Sunucu, istemcinin kabul edilebilir olarak tanımladığı hiçbir içerik üretmiyor.
    TIMED_OUT: 408,          // Sunucu, isteği tamamlamak için çok uzun süre bekledi.
    CONFLICT: 409,           // İstek, sunucuda mevcut olan bir durumla çakışıyor. Örneğin, benzersiz olması gereken bir alanın tekrar gönderilmesi.
    GONE: 410,               // İstenen kaynak artık bu adreste mevcut değil ve gelecekte de olmayacak. 404'ten daha kalıcı bir durum.
    UNSUPPORTED_MEDIA_TYPE: 415, // Sunucu, isteğin içerdiği medya türünü desteklemiyor.
    UNPROCESSIBLE_ENTITY: 422,   // Sunucu isteği anladı ancak anlamsal hatalar nedeniyle işleyemedi. Genellikle validasyon hataları için kullanılır.
    TOO_MANY_REQUESTS: 429,    // Kullanıcı çok fazla istek gönderdi. Rate limiting uygulandığında kullanılır.
    INT_SERVER_ERROR: 500,     // Sunucuda beklenmedik bir hata oluştu ve istek tamamlanamadı.
    BAD_GATEWAY: 502           // Sunucu, yukarı akış sunucularından geçersiz bir yanıt aldı.
};
module.exports = HTTP_CODES;