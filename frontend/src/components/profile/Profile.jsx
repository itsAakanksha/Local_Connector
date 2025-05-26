import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  MapPinIcon, 
  CalendarIcon, 
  PencilIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../auth/AuthContext'
import PostCard from '../post/PostCard'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import LoadingSpinner from '../ui/LoadingSpinner'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import { userService } from '../../services/userService'
import { postService } from '../../services/postService'

const Profile = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  console.log('Current user:', currentUser)
  
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: ''
  })

  // If no username in params, it's the current user's profile
  // If username matches current user's username, it's also own profile
  const isOwnProfile = !username || username === currentUser?.username

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isOwnProfile) {
        // Use current user data
        setProfile(currentUser)
        setEditForm({
          name: currentUser?.name || '',
          bio: currentUser?.bio || '',
          location: currentUser?.location || ''
        })
      } else {
        // Fetch other user's profile using real API
        const response = await userService.getUserProfile(currentUser?.username)
        if (response.success) {
          setProfile(response.data)
        } else {
          throw new Error(response.message || 'User not found')
        }
      }

      // Fetch user's posts
      await fetchUserPosts()
      
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
      if (error.message === 'User not found') {
        navigate('/')
      }    } finally {
      setIsLoading(false)
    }
  }, [isOwnProfile, username, currentUser])

  useEffect(() => {
    if (currentUser) {
      fetchProfile()
    }
  }, [fetchProfile, currentUser])

  const fetchUserPosts = async () => {
    try {
      const targetUsername = username || currentUser?.username
      if (!targetUsername) return

      const response = await userService.getUserPosts(targetUsername)
      if (response.success) {
        setPosts(response.data.posts || [])
      } else {
        console.error('Failed to fetch user posts:', response.message)
        setPosts([])
      }
    } catch (error) {
      console.error('Error fetching user posts:', error)
      setPosts([])
    }
  }
  const handleFollow = async () => {
    try {
      // TODO: Implement follow/unfollow API when backend supports it
      // await userService.followUser(userId)
      
      setIsFollowing(!isFollowing)
      toast.success(isFollowing ? 'Unfollowed' : 'Following!')
    } catch (error) {
      console.error('Error following user:', error)
      toast.error('Failed to follow user')
    }
  }
  const handleEditProfile = async (e) => {
    e.preventDefault()
    
    try {
      const response = await userService.updateProfile(editForm)
      if (response.success) {
        // Update local state with returned data
        setProfile(prev => ({
          ...prev,
          ...response.data
        }))
        
        setShowEditModal(false)
        toast.success('Profile updated!')
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    }
  }
  // Post interaction handlers
  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p._id === postId || p.id === postId)
      const isLiked = post.likedBy?.includes(currentUser?.id)
      
      if (isLiked) {
        const response = await postService.dislikePost(postId)
        if (response.success) {
          setPosts(prev => prev.map(p => {
            if (p._id === postId || p.id === postId) {
              return {
                ...p,
                likedBy: p.likedBy.filter(id => id !== currentUser?.id)
              }
            }
            return p
          }))
        }
      } else {
        const response = await postService.likePost(postId)
        if (response.success) {
          setPosts(prev => prev.map(p => {
            if (p._id === postId || p.id === postId) {
              return {
                ...p,
                likedBy: [...(p.likedBy || []), currentUser?.id]
              }
            }
            return p
          }))
        }
      }
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
    }
  }
  const handleReply = async (postId, content) => {
    try {
      const response = await postService.createReply(postId, content)
      if (response.success) {
        const newReply = response.data

        setPosts(prev => prev.map(post => {
          if (post._id === postId || post.id === postId) {
            return {
              ...post,
              replyCount: (post.replyCount || 0) + 1
            }
          }
          return post
        }))

        toast.success('Reply posted!')
        return newReply
      } else {
        throw new Error(response.message || 'Failed to post reply')
      }
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
      throw error
    }
  }
  const handleDelete = async (postId) => {
    try {
      // TODO: Implement delete post API when backend supports it
      // const response = await postService.deletePost(postId)
      // if (response.success) {
        setPosts(prev => prev.filter(post => post._id !== postId && post.id !== postId))
        toast.success('Post deleted')
      // }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go back to feed</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>
        
        {isOwnProfile && (
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col items-center md:items-start">
            <Avatar user={profile} size="xl" />
            
            {!isOwnProfile && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                className="mt-4 w-full md:w-auto"
              >
                {isFollowing ? (
                  <>
                    <UserMinusIcon className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Profile details */}
          <div className="flex-1 mt-6 md:mt-0 text-center md:text-left">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {profile.name}
            </h1>
            <p className="text-muted-foreground mb-4">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-foreground mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
              {profile.location && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  Joined {new Date(profile.joinedAt || profile.createdAt || Date.now()).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-6 text-sm">
              <div>
                <span className="font-semibold text-foreground">
                  {posts.length}
                </span>
                <span className="text-muted-foreground ml-1">
                  {posts.length === 1 ? 'Post' : 'Posts'}
                </span>
              </div>
              
              {!isOwnProfile && (
                <>
                  <div>
                    <span className="font-semibold text-foreground">
                      {profile.followers || 0}
                    </span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-foreground">
                      {profile.following || 0}
                    </span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {isOwnProfile ? 'Your Posts' : `${profile.name}'s Posts`}
          </h2>
          <span className="text-muted-foreground text-sm">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post) => (
                <PostCard
                  key={post._id || post.id}
                  post={post}
                  onLike={handleLike}
                  onReply={handleReply}
                  onDelete={isOwnProfile ? handleDelete : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <PencilIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isOwnProfile ? 'No posts yet' : 'No posts to show'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isOwnProfile 
                ? 'Share your first post with the community!'
                : 'This user hasn\'t shared anything yet.'
              }
            </p>
            {isOwnProfile && (
              <Button onClick={() => navigate('/create')}>
                Create Your First Post
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="md"
      >
        <form onSubmit={handleEditProfile} className="space-y-6">
          <Input
            label="Name"
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Your full name"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {editForm.bio.length}/160 characters
            </p>
          </div>
          
          <Input
            label="Location"
            value={editForm.location}
            onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, State, Country"
            required
          />
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Profile
