const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const { ROLES, rolePermissions } = require("../constans/rolesAndPermissions");
const { MESSAGES, HTTP_CODES } = require("../constans");


const verifyAccessToken = (req, res, next) => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new Error(MESSAGES.TOKEN_REQUIRED, HTTP_CODES.FORBIDDEN));
  }

  try {
    const decoded = jwt.verify(token, accessToken.secret);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new Error(MESSAGES.INVALID_TOKEN, HTTP_CODES.UNAUTHORIZED));
  }
};

const verifyRefreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new Error(MESSAGES.TOKEN_REQUIRED, HTTP_CODES.FORBIDDEN));
  }

  try {
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return next(new Error(MESSAGES.INVALID_TOKEN, HTTP_CODES.FORBIDDEN));
    }

    const decoded = jwt.verify(token, refreshToken.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      await RefreshToken.deleteOne({
        token: req.cookies.refreshToken || req.body.refreshToken,
      });
      return next(new Error(MESSAGES.TOKEN_EXPIRED, HTTP_CODES.FORBIDDEN));
    }
    return next(new Error(MESSAGES.INVALID_TOKEN, HTTP_CODES.FORBIDDEN));
  }
};

const authenticate = async (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new AppError(MESSAGES.TOKEN_REQUIRED, HTTP_CODES.FORBIDDEN));
  }

  try {
    // DB'den güncel kullanıcıyı al (Rollerin güncel olması için önemli)
    const decoded = jwt.verify(token, accessToken.secret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: MESSAGES.USER_NOT_FOUND });
    }
    req.user = user; // TAM KULLANICI NESNESİNİ EKLE
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: MESSAGES.SESSION_EXPIRED });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(HTTP_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_TOKEN });
    }
    console.error("Authenticate Error:", err);
    return res.status(HTTP_CODES.INT_SERVER_ERROR).json({ message: MESSAGES.AUTHENTICATION_ERROR });
  }
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // authenticate middleware'i req.user'ı (roller dahil) doldurmuş olmalı
    if (!req.user || !Array.isArray(req.user.roles)) {
      console.error("RBAC checkPermission Error: req.user.roles tanımsız.");
      return next(new AppError(MESSAGES.INVALID_ROLE, HTTP_CODES.UNAUTHORIZED));
    }

    const userRoles = req.user.roles;

    if (userRoles.includes(ROLES.ADMIN)) {
      return next(); // Admin her zaman yetkili
    }

    let hasPermission = false;
    for (const role of userRoles) {
      const permissionsForRole = rolePermissions[role] || [];
      if (permissionsForRole.includes(requiredPermission)) {
        hasPermission = true;
        break;
      }
    }

    if (hasPermission) {
      next();
    } else {
      return next(new AppError(MESSAGES.PERMISSION_DENIED, HTTP_CODES.FORBIDDEN));
    }
  };
};

module.exports = {  
  verifyAccessToken,
  verifyRefreshToken,
  authenticate,
  checkPermission
};
