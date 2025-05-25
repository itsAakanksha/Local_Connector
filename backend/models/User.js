const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio cannot exceed 150 characters'],
        default: ''
    },
    profileImageUrl: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        maxlength: [100, 'Location cannot exceed 100 characters'],
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for performance and uniqueness
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash password if it has been modified (or is new)
    if (!this.isModified('passwordHash')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Transform output to exclude sensitive data
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.passwordHash;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);