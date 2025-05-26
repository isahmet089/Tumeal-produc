const User = require("../../models/User");
const Favorite = require("../../models/Favorite");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");   
const Log = require("../../models/Log");
const Notification = require("../../models/Notification");

const showMenu = async (req, res) => {
    res.render("www/menu", {
        error: null,
        success: null
    });
};

const showFeed = async (req, res) => {
    res.render("www/feed", {
        error: null,
        success: null
    });
};
const showNotification = async (req, res) => {
    const user = req.user || res.locals.user;
    if (!user) return res.redirect('/login');
    const logs = await Log.find({ user: user._id })
        .sort('-createdAt')
        .limit(50)
        .populate('user', 'firstName lastName email');
    res.render('www/notification', { logs });
};


//menu favorite işlemleri
const toggleFavorite = async (req, res) => {
    try {
        // Kullanıcı kontrolü
        if (!res.locals.user) {
            return res.status(401).json({ 
                error: 'Bu işlem için giriş yapmanız gerekiyor' 
            });
        }

        const { mealId } = req.body;
        const userId = res.locals.user._id;

        if (!mealId) {
            return res.status(400).json({ 
                error: 'Menü ID\'si gerekli' 
            });
        }

        // Kullanıcının favorilerini kontrol et
        const favorite = await Favorite.findOne({ 
            user: userId,
            meal: mealId
        });

        let isFavorite;
        if (favorite) {
            // Favoriden çıkar
            await Favorite.deleteOne({ _id: favorite._id });
            isFavorite = false;
        } else {
            // Favorilere ekle
            await Favorite.create({
                user: userId,
                meal: mealId
            });
            isFavorite = true;
        }

        // Başarılı yanıt döndür
        res.json({ 
            isFavorite,
            message: isFavorite ? 'Menü favorilere eklendi' : 'Menü favorilerden çıkarıldı'
        });

    } catch (error) {
        console.error('Favori işlemi hatası:', error);
        res.status(500).json({ 
            error: 'Favori işlemi sırasında bir hata oluştu' 
        });
    }
};

//post işlemleri
const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = res.locals.user._id;
            
        
        if (!content) {
            return res.status(400).json({ 
                error: 'İçerik gerekli' 
            });
        }

        const post = new Post({
            user: userId,
            content
        });

        await post.save();

        // Populate user bilgilerini ekle
        await post.populate('user', 'firstName lastName email');

        res.json({  
            success: 'Post başarıyla oluşturuldu',
            post
        });
    } catch (error) {
        console.error('Post oluşturma hatası:', error);
        res.status(500).json({ 
            error: 'Lütfen giriş yapınız!' 
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'firstName lastName email')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .sort('-createdAt');

        res.json(posts);
    } catch (error) {
        console.error('Post getirme hatası:', error);
        res.status(500).json({ error: 'Postlar getirilemedi' });
    }
};

const addComment = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const userId = res.locals.user._id;

        if (!content) {
            return res.status(400).json({ error: 'Yorum içeriği gerekli' });
        }

        if (!postId) {
            return res.status(400).json({ error: 'Post ID gerekli' });
        }

        const comment = new Comment({
            user: userId,
            post: postId,
            content
        });

        await comment.save();

        // Post'a yorumu ekle
        await Post.findByIdAndUpdate(postId, {
            $push: { comments: comment._id }
        });

        // Yorumu populate et
        await comment.populate('user', 'firstName lastName email');

        res.json({
            success: 'Yorum başarıyla eklendi',
            comment
        });
    } catch (error) {
        console.error('Yorum ekleme hatası:', error);
        res.status(500).json({ error: 'Yorum eklenemedi' });
    }
};

// Yorumları getir
const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('user', 'firstName lastName email')
            .sort('-createdAt');

        res.json(comments);
    } catch (error) {
        console.error('Yorum getirme hatası:', error);
        res.status(500).json({ error: 'Yorumlar getirilemedi' });
    }
};
const getSelfComments = async (req, res) => {
    try {
        // Kullanıcı kontrolü
        if (!res.locals.user) {
            return res.status(401).json({ 
                error: 'Bu işlem için giriş yapmanız gerekiyor' 
            });
        }

        const userId = res.locals.user._id;

        // Kullanıcının yorumlarını getir
        const comments = await Comment.find({ user: userId })
            .populate('user', 'firstName lastName email')
            .populate({
                path: 'post',
                select: 'content createdAt',
                populate: {
                    path: 'user',
                    select: 'firstName lastName'
                }
            })
            .sort('-createdAt');

        res.json(comments);
    } catch (error) {
        console.error('Kullanıcı yorumları getirme hatası:', error);
        res.status(500).json({ error: 'Yorumlar getirilemedi' });
    }
};
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = res.locals.user._id;

        const comment = await Comment.findOne({ _id: commentId, user: userId });
        if (!comment) {
            return res.status(404).json({ error: 'Yorum bulunamadı' });
        }

        // Yorumu sil
        await Comment.deleteOne({ _id: commentId });

        // Post'tan yorumu kaldır
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: commentId }
        });

        res.json({ success: 'Yorum başarıyla silindi' });
    } catch (error) {
        console.error('Yorum silme hatası:', error);
        res.status(500).json({ error: 'Yorum silinirken bir hata oluştu' });
    }
};
const getSelfPosts = async (req, res) => {
    try {
        // Kullanıcı kontrolü
        if (!res.locals.user) {
            return res.status(401).json({ 
                error: 'Bu işlem için giriş yapmanız gerekiyor' 
            });
        }

        const userId = res.locals.user._id;

        // Kullanıcının postlarını getir
        const posts = await Post.find({ user: userId })
            .populate('user', 'firstName lastName email')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email'
                }
            })
            .sort('-createdAt');

        res.json(posts);
    } catch (error) {
        console.error('Kullanıcı postları getirme hatası:', error);
        res.status(500).json({ error: 'Postlar getirilemedi' });
    }
};
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = res.locals.user._id;

        const post = await Post.findOne({ _id: postId, user: userId });
        if (!post) {
            return res.status(404).json({ error: 'Post bulunamadı' });
        }

        await Post.deleteOne({ _id: postId });
        await Comment.deleteMany({ post: postId });

        res.json({ success: 'Post başarıyla silindi' });
    } catch (error) {
        console.error('Post silme hatası:', error);
        res.status(500).json({ error: 'Post silinirken bir hata oluştu' });
    }
};


const likePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = res.locals.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post bulunamadı' });
        }

        // Beğeni durumunu kontrol et
        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Beğeniyi kaldır
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Beğeni ekle
            post.likes.push(userId);
        }

        await post.save();

        res.json({
            success: true,
            likes: post.likes
        });
    } catch (error) {
        console.error('Beğeni işlemi hatası:', error);
        res.status(500).json({ error: 'Beğeni işlemi sırasında bir hata oluştu' });
    }
};

const getFeedBugun = async (req, res) => {
    try {
        const mealPosts = await Post.find({
            keywords: { $in: ['yemekhane', 'menu', 'bugun'] }
        })
        .populate('user', 'firstName lastName email')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'firstName lastName'
            }
        })
        .sort({ createdAt: -1 });
        
        // feed.ejs'deki gibi user'ı gönder
        res.render('www/feed-bugun', {
            title: 'Bugünkü Yemek Yorumları', // locals.user yerine direkt user olarak gönder
            posts: mealPosts
        });
    } catch (error) {
        console.error('Yemek yorumları yükleme hatası:', error);
        res.status(500).render('error', {
            message: 'Yemek yorumları yüklenirken bir hata oluştu'
        });
    }
};
const getUser = async (req, res) => {
    try {
        // Profilini görüntüleyeceğimiz kullanıcıyı bul
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).render('error', { message: 'Kullanıcı bulunamadı' });
        }

        // O kullanıcının post ve yorumlarını getir
        const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
        const comments = await Comment.find({ user: user._id }).sort({ createdAt: -1 });

        // Profil sayfasını render et
        res.render('www/userProfile', {
            profileUser: user,      // Görüntülenen kullanıcı
            posts,                  // O kullanıcının postları
            comments,               // O kullanıcının yorumları
            currentUser: req.user   // Giriş yapan kullanıcı (oturum)
        });
    } catch (err) {
        res.status(500).render('error', { message: 'Bir hata oluştu' });
    }
};
const getStats = async (req, res) => {
    try {
        // Bugünün başlangıcı
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Bugünkü post ve yorum sayısı
        const dailyPosts = await Post.countDocuments({ createdAt: { $gte: today } });
        const dailyComments = await Comment.countDocuments({ createdAt: { $gte: today } });

        // Toplam kullanıcı
        const totalUsers = await User.countDocuments();

        // Toplam etkileşim (tüm beğeni + tüm yorum)
        const totalComments = await Comment.countDocuments();
        const posts = await Post.find({}, 'likes');
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes ? post.likes.length : 0), 0);
        const totalInteractions = totalComments + totalLikes;

        // Şu an aktif kullanıcı (son 15 dakika)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeUsers = await User.countDocuments({ lastActiveAt: { $gte: fifteenMinutesAgo } });

        // JSON döndür (AJAX için)
        res.json({
            dailyPosts,
            dailyComments,
            totalUsers,
            totalInteractions,
            activeUsers
        });
    } catch (err) {
        res.status(500).json({ error: 'İstatistikler alınamadı' });
    }
};
const getStats2 = async (req, res) => {
    try {
        // Toplam yorum
        const totalComments = await Comment.countDocuments();

        // Aktif kullanıcı (son 15 dakika)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const activeUsers = await User.countDocuments({ lastActiveAt: { $gte: fifteenMinutesAgo } });

        // Toplam beğeni
        const posts = await Post.find({}, 'likes');
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes ? post.likes.length : 0), 0);

        res.json({
            totalComments,
            activeUsers,
            totalLikes
        });
    } catch (err) {
        res.status(500).json({ error: 'İstatistikler alınamadı' });
    }
};

const getAppNotifications = async (req, res) => {
    try {
        console.log('Uygulama bildirimleri isteniyor...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const notifications = await Notification.find({
            notificationType: 'app',
            isActive: true,
            createdAt: { $gte: thirtyDaysAgo }
        })
        .sort({ createdAt: -1 })
        .lean();

        console.log(`${notifications.length} adet uygulama bildirimi bulundu`);
        res.json(notifications);
    } catch (error) {
        console.error('Uygulama bildirimleri getirme hatası:', error);
        res.status(500).json({ error: "Bildirimler getirilirken bir hata oluştu" });
    }
};

const getMealNotifications = async (req, res) => {
    try {
        console.log('Yemekhane bildirimleri isteniyor...');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const notifications = await Notification.find({
            notificationType: 'meal',
            isActive: true,
            createdAt: { $gte: thirtyDaysAgo }
        })
        .sort({ createdAt: -1 })
        .lean();

        console.log(`${notifications.length} adet yemekhane bildirimi bulundu`);
        res.json(notifications);
    } catch (error) {
        console.error('Yemekhane bildirimleri getirme hatası:', error);
        res.status(500).json({ error: "Bildirimler getirilirken bir hata oluştu" });
    }
};

module.exports = {
    toggleFavorite,
    showMenu,
    showFeed,
    createPost,
    getPosts,
    addComment,
    getComments,
    getSelfComments,
    getSelfPosts,
    likePost,
    deletePost,
    deleteComment,
    showNotification,
    getFeedBugun,
    getUser,
    getStats,
    getStats2,
    getAppNotifications,
    getMealNotifications

};
