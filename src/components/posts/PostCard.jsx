import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiHeart, FiMessageCircle, FiTrash2, FiExternalLink, FiMoreHorizontal } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'
import CommentSection from '../comments/CommentSection'
import './PostCard.css'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}

export default function PostCard({ post, onDelete, onUpdate, style }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [liked, setLiked] = useState(post.likes?.some(l => l.profile_id === user?.id) || false)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0)
  const [showMenu, setShowMenu] = useState(false)

  async function handleLike() {
    if (liked) {
      setLiked(false)
      setLikeCount(prev => prev - 1)
      await supabase
        .from('likes')
        .delete()
        .eq('profile_id', user.id)
        .eq('target_id', post.id)
        .eq('target_type', 'post')
    } else {
      setLiked(true)
      setLikeCount(prev => prev + 1)
      await supabase.from('likes').insert({
        profile_id: user.id,
        target_id: post.id,
        target_type: 'post',
      })
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) onDelete?.(post.id)
  }

  function handleCommentAdded() {
    setCommentCount(prev => prev + 1)
  }

  const isOwn = post.profile_id === user?.id

  return (
    <Card className="post-card animate-fade-in-up" padding={false} style={style}>
      {/* Header */}
      <div className="post-card__header">
        <Avatar
          src={post.author?.profile_photo_url}
          name={post.author?.full_name || ''}
          size="md"
          onClick={() => navigate(`/profile/${post.author?.id}`)}
        />
        <div className="post-card__meta">
          <span
            className="post-card__author"
            onClick={() => navigate(`/profile/${post.author?.id}`)}
          >
            {post.author?.full_name || 'Unknown'}
          </span>
          <span className="post-card__time">
            @{post.author?.username} · {timeAgo(post.created_at)}
          </span>
        </div>
        {isOwn && (
          <div className="post-card__menu-wrap">
            <button className="post-card__menu-btn" onClick={() => setShowMenu(!showMenu)}>
              <FiMoreHorizontal />
            </button>
            {showMenu && (
              <div className="post-card__dropdown">
                <button className="post-card__dropdown-item post-card__dropdown-item--danger" onClick={handleDelete}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && <p className="post-card__content">{post.content}</p>}

      {/* Image */}
      {post.post_type === 'image' && post.media_url && (
        <div className="post-card__image">
          <img src={post.media_url} alt="Post" loading="lazy" />
        </div>
      )}

      {/* Link */}
      {post.post_type === 'link' && post.link_url && (
        <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="post-card__link">
          <FiExternalLink />
          <span>{post.link_url}</span>
        </a>
      )}

      {/* Actions */}
      <div className="post-card__actions">
        <button
          className={`post-card__action ${liked ? 'post-card__action--liked' : ''}`}
          onClick={handleLike}
        >
          <FiHeart className={liked ? 'filled' : ''} />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>
        <button
          className="post-card__action"
          onClick={() => setShowComments(!showComments)}
        >
          <FiMessageCircle />
          <span>{commentCount > 0 ? commentCount : ''}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection postId={post.id} onCommentAdded={handleCommentAdded} />
      )}
    </Card>
  )
}
