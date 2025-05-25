const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ 
            username: req.params.username,
            isActive: true 
        }).select('-passwordHash');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile'
        });
    }
});

// @desc    Get posts by user
// @route   GET /api/users/:username/posts
// @access  Public
router.get('/:username/posts', async (req, res) => {
    try {
        // First find the user
        const user = await User.findOne({ 
            username: req.params.username,
            isActive: true 
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get user's posts
        const posts = await Post.find({ 
            authorId: user._id,
            isActive: true 
        })
            .populate('authorId', 'username profileImageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({ 
            authorId: user._id,
            isActive: true 
        });
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
        console.error('Get user posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user posts'
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, [
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Bio cannot exceed 150 characters'),
    body('location')
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

        const { bio, location } = req.body;
        const updateData = {};

        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-passwordHash');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
});


// @desc    Search users by username
// @route   GET /api/users/search
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const users = await User.find({
            username: { $regex: q.trim(), $options: 'i' },
            isActive: true
        })
        .select('username profileImageUrl bio')
        .limit(10);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error searching users'
        });
    }
});

module.exports = router;
