const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary, handleUploadError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
router.post('/', protect, upload.single('image'), uploadToCloudinary, handleUploadError, [
    body('textContent')
        .trim()
        .notEmpty()
        .withMessage('Post content is required')
        .isLength({ max: 280 })
        .withMessage('Post content cannot exceed 280 characters'),
    body('postType')
        .isIn(['recommend', 'help', 'update', 'event'])
        .withMessage('Invalid post type'),
    body('locationText')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Location cannot exceed 100 characters')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { textContent, postType, locationText } = req.body;
        
        const postData = {
            authorId: req.user._id,
            textContent,
            postType,
            locationText: locationText || ''
        };

        // Add image data if uploaded
        if (req.file) {
            postData.imageUrl = req.file.path;
            postData.cloudinaryPublicId = req.file.filename;
        }

        // Create post
        const post = await Post.create(postData);
        
        // Populate author info
        await post.populate('authorId', 'username profileImageUrl');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: post
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating post'
        });
    }
});

// @desc    Get all posts (with filtering and pagination)
// @route   GET /api/posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query object
        let query = { isActive: true };

        // Filter by location
        if (req.query.location) {
            query.locationText = { $regex: req.query.location, $options: 'i' };
        }

        // Filter by post type
        if (req.query.postType) {
            query.postType = req.query.postType;
        }

        // Get posts with pagination
        const posts = await Post.find(query)
            .populate('authorId', 'username profileImageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPosts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching posts'
        });
    }
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('authorId', 'username profileImageUrl');

        if (!post || !post.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.json({
            success: true,
            data: post
        });

    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching post'
        });
    }
});

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post || !post.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const userId = req.user._id;
        
        // Remove from disliked if present
        post.dislikedBy = post.dislikedBy.filter(id => !id.equals(userId));
        
        // Toggle like
        const likedIndex = post.likedBy.findIndex(id => id.equals(userId));
        
        if (likedIndex > -1) {
            // Unlike
            post.likedBy.splice(likedIndex, 1);
        } else {
            // Like
            post.likedBy.push(userId);
        }

        await post.save();

        res.json({
            success: true,
            message: likedIndex > -1 ? 'Post unliked' : 'Post liked',
            data: {
                likeCount: post.likedBy.length,
                dislikeCount: post.dislikedBy.length,
                isLiked: likedIndex === -1,
                isDisliked: false
            }
        });

    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error liking post'
        });
    }
});

// @desc    Dislike a post
// @route   POST /api/posts/:id/dislike
// @access  Private
router.post('/:id/dislike', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post || !post.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const userId = req.user._id;
        
        // Remove from liked if present
        post.likedBy = post.likedBy.filter(id => !id.equals(userId));
        
        // Toggle dislike
        const dislikedIndex = post.dislikedBy.findIndex(id => id.equals(userId));
        
        if (dislikedIndex > -1) {
            // Remove dislike
            post.dislikedBy.splice(dislikedIndex, 1);
        } else {
            // Dislike
            post.dislikedBy.push(userId);
        }

        await post.save();

        res.json({
            success: true,
            message: dislikedIndex > -1 ? 'Post undisliked' : 'Post disliked',
            data: {
                likeCount: post.likedBy.length,
                dislikeCount: post.dislikedBy.length,
                isLiked: false,
                isDisliked: dislikedIndex === -1
            }
        });

    } catch (error) {
        console.error('Dislike post error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error disliking post'
        });
    }
});

// @desc    Create a reply to a post
// @route   POST /api/posts/:id/replies
// @access  Private
router.post('/:id/replies', protect, [
    body('textContent')
        .trim()
        .notEmpty()
        .withMessage('Reply content is required')
        .isLength({ max: 280 })
        .withMessage('Reply content cannot exceed 280 characters')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const post = await Post.findById(req.params.id);
        
        if (!post || !post.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Create reply
        const reply = await Reply.create({
            postId: req.params.id,
            authorId: req.user._id,
            textContent: req.body.textContent
        });

        // Increment reply count on post
        post.replyCount += 1;
        await post.save();

        // Populate author info
        await reply.populate('authorId', 'username profileImageUrl');

        res.status(201).json({
            success: true,
            message: 'Reply created successfully',
            data: reply
        });

    } catch (error) {
        console.error('Create reply error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating reply'
        });
    }
});

// @desc    Get replies for a post
// @route   GET /api/posts/:id/replies
// @access  Public
router.get('/:id/replies', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const replies = await Reply.find({ 
            postId: req.params.id, 
            isActive: true 
        })
            .populate('authorId', 'username profileImageUrl')
            .sort({ createdAt: 1 }) // Oldest first for replies
            .skip(skip)
            .limit(limit);

        const totalReplies = await Reply.countDocuments({ 
            postId: req.params.id, 
            isActive: true 
        });
        const totalPages = Math.ceil(totalReplies / limit);

        res.json({
            success: true,
            data: {
                replies,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalReplies,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get replies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching replies'
        });
    }
});

module.exports = router;
