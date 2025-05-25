const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post ID is required']
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    textContent: {
        type: String,
        required: [true, 'Reply content is required'],
        maxlength: [280, 'Reply content cannot exceed 280 characters'],
        trim: true
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for performance
replySchema.index({ postId: 1 });
replySchema.index({ authorId: 1 });
replySchema.index({ createdAt: -1 });

// Virtual for like count
replySchema.virtual('likeCount').get(function() {
    return this.likedBy.length;
});

// Ensure virtuals are included in JSON output
replySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Reply', replySchema);