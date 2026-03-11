import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { FiHeart, FiTrash2 } from 'react-icons/fi'
import './CommentSection.css'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export default function CommentSection({ postId, onCommentAdded }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [postId])

  async function fetchComments() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_profile_id_fkey(id, full_name, username, profile_photo_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch likes separately (no FK between likes and comments)
      const commentIds = (data || []).map(c => c.id)
      let likesMap = {}
      if (commentIds.length > 0) {
        const { data: allLikes } = await supabase
          .from('likes')
          .select('id, profile_id, target_id')
          .in('target_id', commentIds)
          .eq('target_type', 'comment')
        ;(allLikes || []).forEach(like => {
          if (!likesMap[like.target_id]) likesMap[like.target_id] = []
          likesMap[like.target_id].push(like)
        })
      }

      const commentsWithLikes = (data || []).map(comment => ({
        ...comment,
        likes: likesMap[comment.id] || []
      }))

      setComments(commentsWithLikes)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      profile_id: user.id,
      content: newComment.trim(),
    })

    if (!error) {
      setNewComment('')
      fetchComments()
      onCommentAdded?.()
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId))
    }
  }

  async function handleLikeComment(comment) {
    const isLiked = comment.likes?.some(l => l.profile_id === user.id)
    if (isLiked) {
      await supabase
        .from('likes')
        .delete()
        .eq('profile_id', user.id)
        .eq('target_id', comment.id)
        .eq('target_type', 'comment')
    } else {
      await supabase.from('likes').insert({
        profile_id: user.id,
        target_id: comment.id,
        target_type: 'comment',
      })
    }
    fetchComments()
  }

  return (
    <div className="comment-section">
      <div className="comment-section__list">
        {comments.map(comment => {
          const isLiked = comment.likes?.some(l => l.profile_id === user.id)
          const isOwn = comment.profile_id === user.id
          return (
            <div key={comment.id} className="comment animate-fade-in">
              <Avatar src={comment.author?.profile_photo_url} name={comment.author?.full_name || ''} size="sm" />
              <div className="comment__body">
                <div className="comment__bubble">
                  <span className="comment__author">{comment.author?.full_name}</span>
                  <p className="comment__text">{comment.content}</p>
                </div>
                <div className="comment__meta">
                  <span className="comment__time">{timeAgo(comment.created_at)}</span>
                  <button
                    className={`comment__action ${isLiked ? 'comment__action--liked' : ''}`}
                    onClick={() => handleLikeComment(comment)}
                  >
                    <FiHeart className={isLiked ? 'filled' : ''} />
                    {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
                  </button>
                  {isOwn && (
                    <button className="comment__action comment__action--delete" onClick={() => handleDelete(comment.id)}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="comment-section__form">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-section__input"
        />
        <Button type="submit" size="sm" disabled={!newComment.trim()} loading={submitting}>
          Post
        </Button>
      </form>
    </div>
  )
}
