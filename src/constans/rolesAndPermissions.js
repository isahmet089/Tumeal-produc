// Roller (Roller)
const ROLES = {
    ADMIN: 'admin',         // Yönetici: Platformdaki en yetkili rol.
    EDITOR: 'editor',       // Eğitmen: Kurs oluşturan ve yöneten rol.
    STUDENT: 'student',     // Öğrenci: Kurslara katılan ve içerikleri tüketen rol.
  };
  
  
  const PERMISSIONS = {
    // === Genel Ayarlar ===
   
  };
  
  
const rolePermissions = {
    // --- Yönetici Rolü İzinleri ---
    [ROLES.ADMIN]: [
     
    ],
    // --- Eğitmen Rolü İzinleri ---
    [ROLES.EDITOR]: [
      
    ],
    // --- Öğrenci Rolü İzinleri ---
    [ROLES.STUDENT]: [
      
    ]
  };
  
  module.exports = { ROLES, PERMISSIONS, rolePermissions };