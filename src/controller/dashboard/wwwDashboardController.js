const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { accessTokenDashboard, refreshTokenDashboard } = require("../../config/jwtConfig");
const RefreshToken = require("../../models/RefreshToken");
const Meal = require("../../models/Meal");
const Comment = require("../../models/Comment");
const Post = require("../../models/Post");
const Hashtag = require("../../models/Hashtag");
const Log = require("../../models/Log");
const Notification = require("../../models/Notification");

const home = (req, res) => {
    res.render("dashboard/blank");
};
const showLogin = (req, res) => {
    res.render("dashboard/login");
};
const showRegister = (req, res) => {
    res.render("dashboard/register");
};
// Token oluşturma fonksiyonu
const generateTokens = (user) => {
    const accessTokenPayload = {
        id: user._id,
        email: user.email,
        studentId: user.studentId
    };
    const refreshTokenPayload = { id: user._id };

    const newAccessToken = jwt.sign(accessTokenPayload, accessTokenDashboard.secret, {
        expiresIn: accessTokenDashboard.expiresIn,
    });

    const newRefreshToken = jwt.sign(refreshTokenPayload, refreshTokenDashboard.secret, {
        expiresIn: refreshTokenDashboard.expiresIn,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "Kullanıcı bulunamadı");
            return res.redirect("/dashboard/login");
        }
        if (user.role !== "admin") {
            req.flash("error", "Bu alana erişim yetkiniz yok");
            return res.redirect("/dashboard/login");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash("error", "Şifre yanlış");
            return res.redirect("/dashboard/login");
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
          res.cookie("accessTokenDashboard", tokens.accessToken, cookieOptions);
          res.cookie("refreshTokenDashboard", tokens.refreshToken, cookieOptions);
          res.locals.user = user;
          console.log(res.locals.user);
        res.redirect("/dashboard/home");
    } catch (error) {
        console.log(error);
        res.render("dashboard/login", {
            error: "Giriş işlemi sırasında bir hata oluştu",
            success: null
        });
    }
};
const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        req.flash("error", "Kullanıcı zaten mevcut");
        return res.redirect("/dashboard/register");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.redirect("/dashboard/login");
};
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        res.clearCookie("accessTokenDashboard", { path: "/" });
        res.clearCookie("refreshTokenDashboard", { path: "/" });

        res.redirect('/dashboard/login');
    } catch (error) {
        res.render('dashboard/login', {
            error: 'Çıkış işlemi sırasında bir hata oluştu',
            success: null
        });
    }
};
//users
const getUsers = async (req, res) => {
    const users = await User.find();
    res.render("dashboard/tables", { users });
};

// Get all users
const getUser = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render("dashboard/userEdit", { users });
    } catch (error) {
        res.status(500).json({ error: "Kullanıcılar getirilirken bir hata oluştu" });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Kullanıcı getirilirken bir hata oluştu" });
    }
};

// Create new user
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, studentId, email, password, role } = req.body;

        // Validasyon
        if (!firstName || !lastName || !studentId || !email || !password) {
            return res.status(400).json({ 
                error: "Tüm alanları doldurunuz" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
        if (existingUser) {
            return res.status(400).json({ 
                error: "Bu email veya öğrenci numarası zaten kullanımda" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            studentId,
            email,
            password: hashedPassword,
            role: role || 'student',
            isVerified: true // Yeni eklenen kullanıcıları otomatik onaylı yap
        });

        res.status(201).json({ 
            message: "Kullanıcı başarıyla oluşturuldu", 
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                studentId: user.studentId,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Kullanıcı oluşturma hatası:', error);
        res.status(500).json({ 
            error: "Kullanıcı oluşturulurken bir hata oluştu" 
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, studentId, email, role, isVerified } = req.body;
        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }

        // Check if email or studentId is already in use by another user
        const existingUser = await User.findOne({
            $or: [{ email }, { studentId }],
            _id: { $ne: userId }
        });
        if (existingUser) {
            return res.status(400).json({ error: "Bu email veya öğrenci numarası zaten kullanımda" });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                studentId,
                email,
                role,
                isVerified: isVerified === 'true'
            },
            { new: true }
        ).select('-password');

        res.json({ message: "Kullanıcı başarıyla güncellendi", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Kullanıcı güncellenirken bir hata oluştu" });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }

        // Delete user
        await User.findByIdAndDelete(userId);
        res.json({ message: "Kullanıcı başarıyla silindi" });
    } catch (error) {
        res.status(500).json({ error: "Kullanıcı silinirken bir hata oluştu" });
    }
};


// yemek işlemleri

const getMeal = async (req, res) => {
    const meals = await Meal.find();
    res.render("dashboard/mealData", { meals });
};
// Yemek listesi sayfasını göster
const getMealEdit = async (req, res) => {
    try {
        const meals = await Meal.find().sort({ date: -1 }); // Tarihe göre sırala
        res.render("dashboard/mealEdit", { meals });
    } catch (error) {
        console.error('Yemek listesi getirme hatası:', error);
        res.status(500).json({ error: "Yemekler getirilirken bir hata oluştu" });
    }
};

// Tekil yemek getir
const getMealById = async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);
        if (!meal) {
            return res.status(404).json({ error: "Yemek bulunamadı" });
        }
        res.json(meal);
    } catch (error) {
        console.error('Yemek getirme hatası:', error);
        res.status(500).json({ error: "Yemek getirilirken bir hata oluştu" });
    }
};

// Yeni yemek oluştur
const createMeal = async (req, res) => {
    try {
        const { date, mealName } = req.body;

        // Tarih kontrolü
        const existingMeal = await Meal.findOne({ date });
        if (existingMeal) {
            return res.status(400).json({ error: "Bu tarih için zaten bir yemek kaydı var" });
        }

        // Toplam kalori hesapla
        const totalCalories = 
            mealName.corba.calories + 
            mealName.anaYemek.calories + 
            mealName.pilav.calories + 
            (mealName.tatli ? mealName.tatli.calories : 0);

        // Yeni yemek oluştur
        const meal = await Meal.create({
            date,
            mealName,
            totalCalories
        });

        res.status(201).json({ 
            message: "Yemek başarıyla oluşturuldu", 
            meal 
        });
    } catch (error) {
        console.error('Yemek oluşturma hatası:', error);
        res.status(500).json({ error: "Yemek oluşturulurken bir hata oluştu" });
    }
};

// Yemek güncelle
const updateMeal = async (req, res) => {
    try {
        const { date, mealName } = req.body;
        const mealId = req.params.id;

        // Yemek kontrolü
        const meal = await Meal.findById(mealId);
        if (!meal) {
            return res.status(404).json({ error: "Yemek bulunamadı" });
        }

        // Tarih kontrolü (eğer tarih değiştiyse)
        if (date !== meal.date) {
            const existingMeal = await Meal.findOne({ date });
            if (existingMeal) {
                return res.status(400).json({ error: "Bu tarih için zaten bir yemek kaydı var" });
            }
        }

        // Toplam kalori hesapla
        const totalCalories = 
            mealName.corba.calories + 
            mealName.anaYemek.calories + 
            mealName.pilav.calories + 
            (mealName.tatli ? mealName.tatli.calories : 0);

        // Yemeği güncelle
        const updatedMeal = await Meal.findByIdAndUpdate(
            mealId,
            {
                date,
                mealName,
                totalCalories
            },
            { new: true }
        );

        res.json({ 
            message: "Yemek başarıyla güncellendi", 
            meal: updatedMeal 
        });
    } catch (error) {
        console.error('Yemek güncelleme hatası:', error);
        res.status(500).json({ error: "Yemek güncellenirken bir hata oluştu" });
    }
};

// Yemek sil
const deleteMeal = async (req, res) => {
    try {
        const mealId = req.params.id;
        
        // Yemek kontrolü
        const meal = await Meal.findById(mealId);
        if (!meal) {
            return res.status(404).json({ error: "Yemek bulunamadı" });
        }

        // Yemeği sil
        await Meal.findByIdAndDelete(mealId);
        res.json({ message: "Yemek başarıyla silindi" });
    } catch (error) {
        console.error('Yemek silme hatası:', error);
        res.status(500).json({ error: "Yemek silinirken bir hata oluştu" });
    }
};

// src/controller/dashboard/wwwDashboardController.js içindeki getCommentEdit fonksiyonunu güncelleyelim
const getCommentEdit = async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate({
                path: 'user',
                select: 'firstName lastName',
                options: { lean: true }
            })
            .populate({
                path: 'post',
                select: 'title',
                options: { lean: true }
            })
            .populate('likes') // likes array'ini populate et
            .lean() // Tüm sonuçları lean olarak al
            .sort({ createdAt: -1 });

        // Null kontrolü
        const safeComments = comments.map(comment => ({
            ...comment,
            user: comment.user || { firstName: 'Silinmiş', lastName: 'Kullanıcı' },
            post: comment.post || { title: 'Silinmiş İçerik' }
        }));
            
        res.render("dashboard/commentEdit", { comments: safeComments });
    } catch (error) {
        console.error('Yorum listesi getirme hatası:', error);
        res.status(500).json({ error: "Yorumlar getirilirken bir hata oluştu" });
    }
};
// Tekil yorum getir
const getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)
            .populate('user', 'firstName lastName')
            .populate('post');
            
        if (!comment) {
            return res.status(404).json({ error: "Yorum bulunamadı" });
        }
        
        res.json(comment);
    } catch (error) {
        console.error('Yorum getirme hatası:', error);
        res.status(500).json({ error: "Yorum getirilirken bir hata oluştu" });
    }
};

// Yorum sil

const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ error: "Yorum bulunamadı" });
        }

        // deleteOne() metodunu kullan
        await Comment.deleteOne({ _id: req.params.id });
        
        res.json({ message: "Yorum başarıyla silindi" });
    } catch (error) {
        console.error('Yorum silme hatası:', error);
        res.status(500).json({ error: "Yorum silinirken bir hata oluştu" });
    }
};

const getPostEdit = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate({
                path: 'user',
                select: 'firstName lastName',
                options: { lean: true }
            })
            .populate({
                path: 'meal',
                select: 'mealName date',
                options: { lean: true }
            })
            .populate('likes')
            .populate('comments')
            .lean()
            .sort({ createdAt: -1 });

        // Null kontrolü
        const safePosts = posts.map(post => ({
            ...post,
            user: post.user || { firstName: 'Silinmiş', lastName: 'Kullanıcı' },
            meal: post.meal || { mealName: { corba: { name: 'Silinmiş' }, anaYemek: { name: 'Yemek' } } }
        }));
            
        res.render("dashboard/postEdit", { posts: safePosts });
    } catch (error) {
        console.error('Post listesi getirme hatası:', error);
        res.status(500).json({ error: "İçerikler getirilirken bir hata oluştu" });
    }
};

// Tekil post getir
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate({
                path: 'user',
                select: 'firstName lastName',
                options: { lean: true }
            })
            .populate({
                path: 'meal',
                select: 'mealName date',
                options: { lean: true }
            })
            .populate('likes')
            .populate('comments')
            .lean();
            
        if (!post) {
            return res.status(404).json({ error: "İçerik bulunamadı" });
        }
        
        res.json(post);
    } catch (error) {
        console.error('Post getirme hatası:', error);
        res.status(500).json({ error: "İçerik getirilirken bir hata oluştu" });
    }
};

// Yeni post oluştur
const createPost = async (req, res) => {
    try {
        const { content } = req.body;

        // Hashtag'leri içerikten çıkar
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);
        const keywords = matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];

        // Yeni post oluştur
        const post = await Post.create({
            user: req.user._id, // Giriş yapmış kullanıcı
            content,
            keywords
        });

        res.status(201).json({ 
            message: "İçerik başarıyla oluşturuldu", 
            post 
        });
    } catch (error) {
        console.error('Post oluşturma hatası:', error);
        res.status(500).json({ error: "İçerik oluşturulurken bir hata oluştu" });
    }
};

// Post güncelle
const updatePost = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;

        // Post kontrolü
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "İçerik bulunamadı" });
        }

        // Hashtag'leri içerikten çıkar
        const hashtagRegex = /#(\w+)/g;
        const matches = content.match(hashtagRegex);
        const keywords = matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];

        // Postu güncelle
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                content,
                keywords
            },
            { new: true }
        );

        res.json({ 
            message: "İçerik başarıyla güncellendi", 
            post: updatedPost 
        });
    } catch (error) {
        console.error('Post güncelleme hatası:', error);
        res.status(500).json({ error: "İçerik güncellenirken bir hata oluştu" });
    }
};

// Post sil
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        
        // Post kontrolü
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "İçerik bulunamadı" });
        }

        // Postu sil
        await Post.findByIdAndDelete(postId);

        // İlgili hashtag'lerin count'larını güncelle
        if (post.keywords && post.keywords.length > 0) {
            for (const tag of post.keywords) {
                await Hashtag.findOneAndUpdate(
                    { name: tag },
                    { $inc: { count: -1 } }
                );
            }
        }

        res.json({ message: "İçerik başarıyla silindi" });
    } catch (error) {
        console.error('Post silme hatası:', error);
        res.status(500).json({ error: "İçerik silinirken bir hata oluştu" });
    }
};

//log
const getLogData = async (req, res) => {
    try {
        const logs = await Log.find()
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        // İstatistikler
        const stats = {
            total: logs.length,
            success: logs.filter(l => l.status >= 200 && l.status < 300).length,
            warning: logs.filter(l => l.status >= 400 && l.status < 500).length,
            error: logs.filter(l => l.status >= 500).length
        };

        res.render('dashboard/logData', { logs, stats });
    } catch (error) {
        console.error('Log listesi getirme hatası:', error);
        res.status(500).json({ error: "Loglar getirilirken bir hata oluştu" });
    }
};

const getLogById = async (req, res) => {
    try {
        const log = await Log.findById(req.params.id)
            .populate('user', 'firstName lastName')
            .lean();
        if (!log) return res.status(404).json({ error: "Log bulunamadı" });
        res.json(log);
    } catch (error) {
        res.status(500).json({ error: "Log detayı alınamadı" });
    }
};

//notification
const getNotificationPage = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
        res.render('dashboard/notification', { notifications });
    } catch (error) {
        res.status(500).json({ error: "Bildirimler getirilirken bir hata oluştu" });
    }
};

const createNotification = async (req, res) => {
    try {
        const { title, message, type, notificationType } = req.body;
        if (!title || !message || !type || !notificationType) {
            return res.status(400).json({ error: "Tüm alanlar zorunludur" });
        }
        const notification = await Notification.create({
            title,
            message,
            type,
            notificationType, // 'app' veya 'meal'
            isActive: true
        });
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: "Bildirim oluşturulamadı" });
    }
};

const getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id).lean();
        if (!notification) return res.status(404).json({ error: "Bildirim bulunamadı" });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: "Bildirim detayı alınamadı" });
    }
};

const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: "Bildirim silindi" });
    } catch (error) {
        res.status(500).json({ error: "Bildirim silinemedi" });
    }
};


const show404 = (req, res) => {
    res.render("dashboard/404");
};

module.exports = {
    home,
    showLogin,
    showRegister,
    login,
    register,
    logout,
    getUsers,
    show404,
    getMeal,
    getUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getMealEdit,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    getCommentEdit,
    getCommentById,
    deleteComment,
    getPostEdit,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getLogData,
    getLogById,
    getNotificationPage,
    createNotification,
    getNotificationById,
    deleteNotification

};

