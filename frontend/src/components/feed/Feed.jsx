import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { toast } from 'react-hot-toast'
import { 
  FunnelIcon, 
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import PostCard from '../post/PostCard'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import Modal from '../ui/Modal'
import postService from '../../services/postService'

const Feed = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    type: 'all',
    sortBy: 'recent'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  })
  // Post types for filtering
  const postTypes = [
    { value: 'all', label: 'All Posts', icon: '📍' },
    { value: 'recommend', label: 'Recommendations', icon: '⭐' },
    { value: 'help', label: 'Help', icon: '🤝' },
    { value: 'update', label: 'Updates', icon: '📢' },
    { value: 'event', label: 'Events', icon: '🎉' }
  ]

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ]
  // Fetch posts
  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      // Use real API call
      const response = await postService.getPosts({
        postType: filters.type,
        sortBy: filters.sortBy
      }, pageNum, 10);

      if (response.success) {
        const { posts: newPosts, pagination } = response.data;
        
        if (reset || pageNum === 1) {
          setPosts(newPosts)
        } else {
          setPosts(prev => [...prev, ...newPosts])
        }

        setHasMore(pagination.hasNextPage)
      } else {
        throw new Error(response.message || 'Failed to fetch posts')
      }
      
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }  }, [filters])

  // Load more posts when scrolling
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      setPage(prev => prev + 1)
      fetchPosts(page + 1, false)
    }
  }, [inView, hasMore, isLoadingMore, page, fetchPosts])

  // Fetch posts when filters change
  useEffect(() => {
    setPage(1)
    fetchPosts(1, true)
  }, [filters, fetchPosts])
  // Handle post interactions
  const handleLike = async (postId) => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post._id === postId || post.id === postId) {
          const isLiked = post.likedBy?.includes(user?.id || user?._id)
          return {
            ...post,
            likedBy: isLiked 
              ? post.likedBy.filter(id => id !== user?.id && id !== user?._id)
              : [...(post.likedBy || []), user?.id || user?._id]
          }
        }
        return post
      }))

      // Make API call
      const response = await postService.likePost(postId)
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to like post')
      }
      
    } catch (error) {
      console.error('Error liking post:', error)
      toast.error('Failed to like post')
      // Revert optimistic update
      fetchPosts(1, true)
    }
  }
  const handleReply = async (postId, content) => {
    try {
      // Make API call
      const response = await postService.createReply(postId, content)
      
      if (response.success) {
        // Update post with new reply count
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
        return response.data
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
      // Make API call
      // await fetch(`/api/posts/${postId}`, { method: 'DELETE' })

      // Remove post from state
      setPosts(prev => prev.filter(post => post._id !== postId && post.id !== postId))
      toast.success('Post deleted')
      
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handleRefresh = () => {
    setPage(1)
    fetchPosts(1, true)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
          <p className="text-muted-foreground">Stay connected with your neighborhood</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
          >
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filter
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Create Button */}
      <Link to="/create">
        <Button className="w-full mb-6" size="lg">
          <PlusIcon className="w-5 h-5 mr-2" />
          Share something with your community
        </Button>
      </Link>

      {/* Active Filters */}
      {(filters.type !== 'all' || filters.sortBy !== 'recent') && (
        <div className="flex items-center space-x-2 mb-6 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {filters.type !== 'all' && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {postTypes.find(t => t.value === filters.type)?.label}
            </span>
          )}
          {filters.sortBy !== 'recent' && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              {sortOptions.find(s => s.value === filters.sortBy)?.label}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ type: 'all', sortBy: 'recent' })}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-32 bg-muted rounded-lg mb-4" />
                <div className="flex space-x-4">
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-8 bg-muted rounded w-16" />
                  <div className="h-8 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <AnimatePresence>
            {posts.map((post, index) => (
              <PostCard
                key={post._id || post.id}
                post={post}
                onLike={handleLike}
                onReply={handleReply}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share something with your community!
            </p>
            <Link to="/create">
              <Button>Create Your First Post</Button>
            </Link>
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && !isLoading && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isLoadingMore && <LoadingSpinner size="md" />}
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You've reached the end!</p>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Posts"
        size="sm"
      >
        <div className="space-y-6">
          {/* Post Type Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Post Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    filters.type === type.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Sort By
            </label>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setFilters({ type: 'all', sortBy: 'recent' })}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              onClick={() => setShowFilters(false)}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Feed
