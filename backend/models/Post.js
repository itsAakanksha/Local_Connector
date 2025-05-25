const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    textContent: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: [280, 'Post content cannot exceed 280 characters'],
        trim: true
    },
    postType: {
        type: String,
        required: [true, 'Post type is required'],
        enum: {
            values: ['recommend', 'help', 'update', 'event'],
            message: 'Post type must be one of: recommend, help, update, event'
        }
    },
    imageUrl: {
        type: String,
        default: ''
    },
    cloudinaryPublicId: {
        type: String,
        default: ''
    },
    locationText: {
        type: String,
        maxlength: [100, 'Location cannot exceed 100 characters'],
        default: '',
        trim: true
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replyCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for performance
postSchema.index({ authorId: 1 });
postSchema.index({ postType: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ locationText: 'text' });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
    return this.likedBy.length;
});

// Virtual for dislike count
postSchema.virtual('dislikeCount').get(function() {
    return this.dislikedBy.length;
});

// Ensure virtuals are included in JSON output
postSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);