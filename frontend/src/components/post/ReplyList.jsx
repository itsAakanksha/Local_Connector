import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../auth/AuthContext'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Input from '../ui/Input'
import LoadingSpinner from '../ui/LoadingSpinner'

const ReplyList = ({ post, onReply, onClose }) => {
  const { user } = useAuth()
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState(post.replies || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Fetch replies if needed
    if (post._id && (!post.replies || post.replies.length === 0)) {
      fetchReplies()
    }
  }, [post._id])

  const fetchReplies = async () => {
    setIsLoading(true)
    try {
      // This would be an API call to fetch replies
      // For now, we'll use the replies from the post
      setReplies(post.replies || [])
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    
    if (!replyText.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const newReply = await onReply?.(post._id || post.id, replyText.trim())
      
      if (newReply) {
        setReplies(prev => [newReply, ...prev])
        setReplyText('')
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Original Post Preview */}
      <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
        <div className="flex items-start space-x-3">
          <Avatar user={post.author} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-foreground">{post.author?.name}</span>
              <span className="text-muted-foreground text-sm">
                @{post.author?.username}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.content}
            </p>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      <form onSubmit={handleSubmitReply} className="space-y-4">
        <div className="flex items-start space-x-3">
          <Avatar user={user} size="sm" />
          <div className="flex-1">
            <Input
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={isSubmitting}
              multiline
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!replyText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Reply
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Replies List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : replies.length > 0 ? (
          <AnimatePresence>
            {replies.map((reply, index) => (
              <motion.div
                key={reply._id || reply.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg"
              >
                <Avatar user={reply.author} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-foreground text-sm">
                      {reply.author?.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      @{reply.author?.username}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">
                    {reply.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No replies yet. Be the first to reply!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReplyList
