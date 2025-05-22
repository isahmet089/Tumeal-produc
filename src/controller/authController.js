const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {HTTP_CODES,MESSAGES} = require("../constans");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig");
const RefreshToken = require("../models/RefreshToken");


const generateTokens = (user) => {
  const accessTokenPayload = {
    id: user._id,
    email: user.email,
    roles: user.roles,
  };
  const refreshTokenPayload = { id: user._id };

  const newAccessToken = jwt.sign(accessTokenPayload, accessToken.secret, {
    expiresIn: accessToken.expiresIn,
  });

  const newRefreshToken = jwt.sign(refreshTokenPayload, refreshToken.secret, {
    expiresIn: refreshToken.expiresIn,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
const registerUser = async (req, res,next) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(HTTP_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.USER_ALREADY_EXISTS });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    res
      .status(HTTP_CODES.CREATED)
      .json({ message: MESSAGES.USER_CREATED_SUCCESSFULLY, user });
  } catch (error) {
    res
      .status(HTTP_CODES.INT_SERVER_ERROR)
      .json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: MESSAGE.USER_NOT_FOUND });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(HTTP_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.INVALID_PASSWORD });
    }
    // Kullanıcının eski tüm refresh tokenlarını sil
    await RefreshToken.deleteMany({ userId: user._id });
    // Yeni tokenları oluştur
    const tokens = generateTokens(user);
    // Yeni refresh token'ı veritabanına kaydet
    await RefreshToken.create({
      userId: user._id,
      token: tokens.refreshToken,
    });
    // Cookie'leri ayarla
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/api/",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });
    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/api/",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
      });

    res.status(HTTP_CODES.OK).json({ message: MESSAGES.LOGIN_SUCCESS, user });
  } catch (error) {
    res
      .status(HTTP_CODES.INT_SERVER_ERROR)
      .json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
  }
};
const logoutUser = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
  
      if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
      }
  
      // Çerezleri temizle
      res.clearCookie("accessToken", { path: "/api/" });
      res.clearCookie("refreshToken", { path: "/api/" });
  
      res.status(HTTP_CODES.OK).json({ message: MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
