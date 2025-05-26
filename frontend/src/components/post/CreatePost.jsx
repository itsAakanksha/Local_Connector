import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { 
  PhotoIcon, 
  XMarkIcon, 
  MapPinIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../auth/AuthContext'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Badge from '../ui/Badge'
import LoadingSpinner from '../ui/LoadingSpinner'
import Avatar from '../ui/Avatar'
import { postService } from '../../services/postService'

const CreatePost = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
    const [formData, setFormData] = useState({
    content: '',
    type: 'recommend',
    location: user?.location || ''
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const maxCharacters = 500
  const postTypes = [
    { value: 'recommend', label: 'Recommendation', icon: '⭐', description: 'Recommend local businesses' },
    { value: 'help', label: 'Help', icon: '🤝', description: 'Ask for help or assistance' },
    { value: 'update', label: 'Update', icon: '📢', description: 'Share community updates' },
    { value: 'event', label: 'Event', icon: '🎉', description: 'Announce local events' }
  ]

  // Handle text input changes
  const handleContentChange = (e) => {
    const content = e.target.value
    if (content.length <= maxCharacters) {
      setFormData(prev => ({ ...prev, content }))
      setCharCount(content.length)
    }
  }

  const handleLocationChange = (e) => {
    setFormData(prev => ({ ...prev, location: e.target.value }))
  }

  const handleTypeChange = (type) => {
    setFormData(prev => ({ ...prev, type }))
  }

  // Image upload handling
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.content.trim()) {
      toast.error('Please write something to share')
      return
    }

    if (!formData.location.trim()) {
      toast.error('Please add a location')
      return
    }

    setIsSubmitting(true)

    try {
      // Create post data matching backend schema
      const postData = {
        textContent: formData.content.trim(),
        postType: formData.type,
        locationText: formData.location.trim()
      }

      // Add image if selected
      if (selectedImage) {
        postData.image = selectedImage
      }

      // Create post using real API call
      const response = await postService.createPost(postData)

      if (response.success) {
        toast.success('Post shared successfully!')
        navigate('/')
      } else {
        throw new Error(response.message || 'Failed to create post')
      }
      
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
        </div>
        
        <h1 className="text-xl font-semibold text-foreground">Create Post</h1>
        <div className="w-20" /> {/* Spacer for center alignment */}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar user={user} size="md" />
            <div>
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
          </div>

          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              What are you sharing?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {postTypes.map((type) => (                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    formData.type === type.value
                      ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg transform scale-[1.02]'
                      : 'bg-card border-border hover:bg-muted hover:border-muted-foreground hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{type.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs opacity-70">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What's happening in your community?
            </label>
            <textarea
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Share what's on your mind..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${
                charCount > maxCharacters * 0.9 
                  ? 'text-destructive' 
                  : 'text-muted-foreground'
              }`}>
                {charCount}/{maxCharacters}
              </span>
              {formData.type !== 'general' && (
                <Badge type={formData.type} size="sm" />
              )}
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="Where are you posting from?"
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Add Photo (Optional)
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input {...getInputProps()} disabled={isSubmitting} />
                <PhotoIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">
                  {isDragActive
                    ? 'Drop your image here'
                    : 'Drag & drop an image, or click to select'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Support: JPG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.content.trim() || !formData.location.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Share Post
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">💡 Posting Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Be respectful and kind to your community members</li>
          <li>• Use specific locations to help neighbors find relevant content</li>
          <li>• Choose the right post type to help others discover your content</li>
          <li>• Add photos to make your posts more engaging</li>
        </ul>
      </div>
    </div>
  )
}

export default CreatePost
