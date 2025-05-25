const mongoose = require('mongoose');
const Hashtag = require('./Hashtag');
const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 180
    },
    meal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    keywords: [{
        type: String,
        required: true,
        enum: ['yemekhane', 'menu', 'bugun', 'oneri', 'sikayet', 'tesekkur'] // İzin verilen keyword'ler
    }],
}, {
    timestamps: true
});

// Beğeni sayısını hesaplayan virtual
postSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Yorum sayısını hesaplayan virtual
postSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});
// Hashtag'leri otomatik çıkaran ve güncelleyen pre-save middleware
postSchema.pre('save', async function(next) {
    if (this.isModified('content')) {
        // İçerikten hashtag'leri çıkar
        const hashtagRegex = /#(\w+)/g;
        const matches = this.content.match(hashtagRegex);
        
        if (matches) {
            // # işaretini kaldır ve küçük harfe çevir
            this.keywords = matches.map(tag => tag.slice(1).toLowerCase());
            
            // Her hashtag için count'u güncelle
            for (const tag of this.keywords) {
                await Hashtag.findOneAndUpdate(
                    { name: tag },
                    { 
                        $inc: { count: 1 },
                        lastUsed: new Date()
                    },
                    { upsert: true }
                );
            }
        } else {
            this.keywords = [];
        }
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);
