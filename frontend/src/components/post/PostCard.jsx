import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ShareIcon,
  MapPinIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../auth/AuthContext'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ReplyList from './ReplyList'

const PostCard = ({ post, onLike, onReply, onDelete }) => {
  const { user } = useAuth()
  const [showReplies, setShowReplies] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const isLiked = post.likedBy?.includes(user?.id || user?._id)
  const isAuthor = post.authorId?._id === user?.id || post.authorId?.id === user?.id

  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    try {
      await onLike?.(post._id || post.id)
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setIsLiking(false)
    }
  }
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.authorId?.username}`,
        text: post.textContent,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast here
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete?.(post._id || post.id)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
      >
        {/* Post header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">            <Avatar user={post.authorId} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground truncate">
                  {post.authorId?.username}
                </h3>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {post.locationText && (
                <div className="flex items-center space-x-1 mt-1">
                  <MapPinIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{post.locationText}</span>
                </div>
              )}
            </div>
          </div>
          
          {isAuthor && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-muted-foreground hover:text-destructive"
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </Button>
          )}
        </div>        {/* Post type badge */}
        {post.postType && (
          <div className="mb-3">
            <Badge type={post.postType} />
          </div>
        )}

        {/* Post content */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {post.textContent}
          </p>
        </div>

        {/* Post image */}
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden bg-muted">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Post stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-6">
            {/* Like button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`group ${isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
            >
              {isLiked ? (
                <HeartIconSolid className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              ) : (
                <HeartIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              )}              <span className="text-sm">{post.likedBy?.length || 0}</span>
            </Button>

            {/* Reply button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(true)}
              className="text-muted-foreground hover:text-blue-500 group"
            >
              <ChatBubbleOvalLeftIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{post.replyCount || 0}</span>
            </Button>

            {/* Share button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-green-500 group"
            >
              <ShareIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Replies Modal */}
      <Modal
        isOpen={showReplies}
        onClose={() => setShowReplies(false)}
        title="Replies"
        size="lg"
      >
        <ReplyList 
          post={post} 
          onReply={onReply}
          onClose={() => setShowReplies(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Post"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default PostCard
