const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage for multer
const storage = multer.memoryStorage();

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Middleware to upload to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        // Upload buffer to Cloudinary
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'cityscope/posts',
                    transformation: [
                        { width: 800, height: 600, crop: 'limit' },
                        { quality: 'auto:good' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(req.file.buffer);
        });

        // Add Cloudinary data to request
        req.file.path = result.secure_url;
        req.file.filename = result.public_id;
        
        next();
    } catch (error) {
        next(error);
    }
};

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
            });
        }
    }
    
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({
            success: false,
            message: 'Only image files are allowed'
        });
    }
    
    next(err);
};

module.exports = {
    upload,
    uploadToCloudinary,
    handleUploadError,
    cloudinary
};
