import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiHeart, FiMessageCircle, FiUserPlus, FiUserCheck, FiCheck, FiCheckCircle, FiTrash2 } from 'react-icons/fi'
import { useNotifications } from '../contexts/NotificationsContext'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import './NotificationsPage.css'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const NOTIFICATION_ICONS = {
  like_post: <FiHeart />,
  like_comment: <FiHeart />,
  comment_post: <FiMessageCircle />,
  friend_request_received: <FiUserPlus />,
  friend_request_accepted: <FiUserCheck />,
}

const NOTIFICATION_COLORS = {
  like_post: 'var(--color-accent-secondary)',
  like_comment: 'var(--color-accent-secondary)',
  comment_post: 'var(--color-info)',
  friend_request_received: 'var(--color-accent-primary)',
  friend_request_accepted: 'var(--color-success)',
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, clearAllNotifications, unreadCount } = useNotifications()

  function handleClick(notif) {
    if (!notif.is_read) markAsRead(notif.id)
    if (notif.target_url) navigate(notif.target_url)
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <h1 className="notifications-page__title">Notifications</h1>
        <div className="notifications-page__actions">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" icon={<FiCheckCircle />} onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" icon={<FiTrash2 />} onClick={clearAllNotifications}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="notifications-page__list">
        {notifications.length === 0 ? (
          <Card><p className="notifications-page__empty">No notifications yet.</p></Card>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`notif-item ${!notif.is_read ? 'notif-item--unread' : ''} animate-fade-in`}
              onClick={() => handleClick(notif)}
            >
              <div className="notif-item__avatar-wrap">
                <Avatar
                  src={notif.sender?.profile_photo_url}
                  name={notif.sender?.full_name || ''}
                  size="md"
                />
                <span
                  className="notif-item__type-icon"
                  style={{ background: NOTIFICATION_COLORS[notif.type] || 'var(--color-bg-hover)' }}
                >
                  {NOTIFICATION_ICONS[notif.type] || <FiCheck />}
                </span>
              </div>
              <div className="notif-item__content">
                <p className="notif-item__message">{notif.message}</p>
                <span className="notif-item__time">{timeAgo(notif.created_at)}</span>
              </div>
              {!notif.is_read && <span className="notif-item__dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
