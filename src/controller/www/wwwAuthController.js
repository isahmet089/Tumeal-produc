const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../../config/jwtConfig");
const RefreshToken = require("../../models/RefreshToken");
const EmailService = require("../../utils/emailService");


// Register sayfasını göster
const showRegister = (req, res) => {
    res.render('www/register', {
        error: null,
        success: null
    });
};
// Login sayfasını göster
const showLogin = (req, res) => {
    res.render('www/login', {
        error: null,
        success: null
    });
};
// Token oluşturma fonksiyonu
const generateTokens = (user) => {
    const accessTokenPayload = {
        id: user._id,
        email: user.email,
        studentId: user.studentId
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
// Register işlemi
const register = async (req, res) => {
    const { firstName, lastName, studentId, email, password, confirmPassword, termsAccepted } = req.body;

    try {
        // Validasyonlar
        if (password !== confirmPassword) {
            return res.render('www/register', {
                error: 'Şifreler eşleşmiyor',
                success: null
            });
        }

        // Checkbox değerini boolean'a çevir
        const termsAcceptedBool = termsAccepted === 'on' ? true : false;

        if (!termsAcceptedBool) {
            return res.render('www/register', {
                error: 'Kullanım koşullarını kabul etmelisiniz',
                success: null
            });
        }

        // E-posta ve öğrenci numarası kontrolü
        const existingUser = await User.findOne({
            $or: [{ email }, { studentId }]
        });

        if (existingUser) {
            return res.render('www/register', {
                error: 'Bu e-posta adresi veya öğrenci numarası zaten kayıtlı',
                success: null
            });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const user = await User.create({
            firstName,
            lastName,
            studentId,
            email,
            password: hashedPassword,
            termsAccepted: termsAcceptedBool  // Boolean değeri kullan
        });

        // Hoş geldin e-postası gönder
        await EmailService.sendWelcomeEmail(user);
         // Doğrulama e-postasını gönder
        await EmailService.sendVerificationEmail(user, user._id);  
        // Tokenları oluştur
        const tokens = generateTokens(user);

        // Refresh token'ı kaydet
        await RefreshToken.create({
            userId: user._id,
            token: tokens.refreshToken,
        });

        // Cookie'leri ayarla
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/api/",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000 // 1 gün
        };

        res.cookie("accessToken", tokens.accessToken, cookieOptions);
        res.cookie("refreshToken", tokens.refreshToken, cookieOptions);
        res.locals.user = user;
        
        // Başarılı kayıt sonrası menu sayfasına yönlendir
        res.redirect('/home');

    } catch (error) {
        console.error('Register error:', error);
        res.render('www/register', {
            error: 'Kayıt işlemi sırasında bir hata oluştu',
            success: null
        });
    }
};
// Login işlemi
const login = async (req, res) => {
    const { email, password, remember } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('www/login', {
                error: 'E-posta adresi veya şifre hatalı',
                success: null
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.render('www/login', {
                error: 'E-posta adresi veya şifre hatalı',
                success: null
            });
        }
        
        // Eski refresh tokenları temizle
        await RefreshToken.deleteMany({ userId: user._id });

        // Yeni tokenları oluştur
        const tokens = generateTokens(user);

        // Refresh token'ı kaydet
        await RefreshToken.create({
            userId: user._id,
            token: tokens.refreshToken,
        });

        // Cookie'leri ayarla
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict"
        };

        // Remember me seçeneğine göre süre ayarla
        if (remember) {
            cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 gün
        } else {
            cookieOptions.maxAge = 24 * 60 * 60 * 1000; // 1 gün
        }

        res.cookie("accessToken", tokens.accessToken, cookieOptions);
        res.cookie("refreshToken", tokens.refreshToken, cookieOptions);
        res.locals.user = user;
        res.redirect('/menu');

    } catch (error) {
        res.render('www/login', {
            error: 'Giriş işlemi sırasında bir hata oluştu',
            success: null
        });
    }
};
// Logout işlemi
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        res.clearCookie("accessToken", { path: "/" });
        res.clearCookie("refreshToken", { path: "/" });

        res.redirect('/login');
    } catch (error) {
        res.render('www/login', {
            error: 'Çıkış işlemi sırasında bir hata oluştu',
            success: null
        });
    }
};

// Forgot Password sayfasını göster
const showForgotPassword = async (req, res) => {
    res.render('www/forgot-password', {
        error: null,
        success: null
    });
}
const forgotPassword = async (req, res) => { 
const { email } = req.body;
const user = await User.findOne({ email });
if(!user){
    return res.render('www/forgot-password', {
        error: 'Bu e-posta adresi kayıtlı değil',
        success: null
    });
}
await EmailService.sendResetPasswordEmail(user, user._id);
return res.render('www/forgot-password', {
    success: 'Şifre sıfırlama linki e-postanıza gönderildi',
    error: null
});
}

// Şifre sıfırlama sayfasını göster
const showResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findById(token);

        if (!user) {
            return res.render('www/reset-password-failed', {
                error: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş',
                success: null
            });
        }

        res.render('www/reset-password', {
            token: req.params.token,
            error: null,
            success: null
        });
    } catch (error) {
        res.render('www/reset-password-error', {
            error: 'Şifre sıfırlama işlemi sırasında bir hata oluştu',
            success: null
        });
    }
};
const resetPassword = async (req, res) => {
    try {
        const {password, confirmPassword} = req.body;
        const {token} = req.params;
        const user = await User.findById(token);
        
        if(!user){
            return res.redirect('/reset-password-error');
        }
        
        if(password !== confirmPassword){
            return res.redirect('/reset-password-error');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        
        return res.redirect('/reset-password-success');

    } catch (error) {
        console.error('Reset password error:', error);
        return res.redirect('/reset-password-error');
    }
};
const showResetPasswordFailed = async (req, res) => {
    res.render('www/reset-password-error', {
        error: null,
        success: null
    });
}
const showResetPasswordSuccess = async (req, res) => {
    res.render('www/reset-password-success', {
        error: null,
        success: null
    });
}

//verify email
const showAccountVerified = async (req, res) => {
    res.render('www/account-verified', {
        error: null,
        success: null
    });
}
const showAccountVerificationFailed = async (req, res) => {
    res.render('www/account-verification-failed', {
        error: null,
        success: null
    });
}
const verifyEmail = async (req, res) => {
    
    const { token } = req.params;
    try {
        // Direkt user._id ile kullanıcıyı bul
        const user = await User.findById(token);

        if (!user) {
            return res.redirect('/verify-email-failed');
        }

        // Kullanıcıyı doğrula
        user.isVerified = true;
        await user.save();
        
        return res.redirect('/verify-email-success');
    } catch (error) {
        console.error('HATA:', error);
        return res.redirect('/verify-email-failed');
    }
}
const resendVerificationEmail = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if(!user){
        return res.render('www/profile', {
            error: 'Kullanıcı bulunamadı',
            success: null
        });
    }
    await EmailService.sendVerificationEmail(user, user._id);
    return res.render('www/profile', {
        success: 'Doğrulama e-postası gönderildi',
        error: null
    });
    } catch (error) {
            return res.render('www/profile', {
                error: 'Doğrulama e-postası gönderimi sırasında bir hata oluştu',
                success: null
            });
    }
}

//Profile sayfasını göster
const showProfile = async (req, res) => {
    res.render('www/profile', {
        error: null,
        success: null
    });
}

module.exports = { 
    showRegister,
    showLogin,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    showForgotPassword,
    showResetPassword,
    verifyEmail,
    showAccountVerified,
    showAccountVerificationFailed,
    showResetPasswordFailed,
    showResetPasswordSuccess,
    resendVerificationEmail,
    showProfile
};