const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 180
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
},
 {
    timestamps: true
});

// Beğeni sayısını hesaplayan virtual
commentSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

module.exports = mongoose.model('Comment', commentSchema);
