import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FiMessageSquare, FiSend, FiArrowLeft, FiPlus, FiSearch, FiX } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { useFriends } from '../contexts/FriendsContext'
import Avatar from '../components/ui/Avatar'
import Spinner from '../components/ui/Spinner'
import './MessengerPage.css'

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDay < 7) return `${diffDay}d`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function formatMessageTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessengerPage() {
  const { user } = useAuth()
  const {
    conversations,
    activeConversationId,
    messages,
    unreadCount,
    loading,
    messagesLoading,
    openConversation,
    sendMessage,
    startConversation,
    markConversationRead,
    setActiveConversationId,
    fetchConversations,
  } = useChat()
  const { friends } = useFriends()

  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [friendSearch, setFriendSearch] = useState('')
  const [mobileView, setMobileView] = useState('list') // 'list' or 'chat'
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark as read when opening a conversation
  useEffect(() => {
    if (activeConversationId) {
      markConversationRead(activeConversationId)
    }
  }, [activeConversationId])

  // Focus input when conversation opens
  useEffect(() => {
    if (activeConversationId && mobileView === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [activeConversationId, mobileView])

  const activeConversation = conversations.find(c => c.id === activeConversationId)

  async function handleSend() {
    if (!messageInput.trim() || !activeConversationId || sending) return
    setSending(true)
    const content = messageInput
    setMessageInput('')
    await sendMessage(activeConversationId, content)
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleSelectFriend(friendId) {
    setShowNewChat(false)
    setFriendSearch('')
    const { conversationId, error } = await startConversation(friendId)
    if (conversationId) {
      await openConversation(conversationId)
      setMobileView('chat')
    }
  }

  function handleOpenConversation(convId) {
    openConversation(convId)
    setMobileView('chat')
  }

  function handleBackToList() {
    setActiveConversationId(null)
    setMobileView('list')
  }

  // Filter friends for new chat (exclude those with existing conversations)
  const existingPartnerIds = conversations.map(c => c.partner.id)
  const filteredFriends = friends.filter(f => {
    const matchesSearch = !friendSearch.trim() ||
      f.full_name.toLowerCase().includes(friendSearch.toLowerCase()) ||
      f.username.toLowerCase().includes(friendSearch.toLowerCase())
    return matchesSearch
  })

  // Group messages by date
  function getDateLabel(dateStr) {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="messenger-page">
      <div className="messenger-page__header">
        <FiMessageSquare className="messenger-page__header-icon" />
        <h1 className="messenger-page__title">Messenger</h1>
      </div>

      <div className="messenger-page__container">
        {/* ─── Conversation List Panel ─── */}
        <div className={`messenger-panel messenger-panel--list ${mobileView === 'chat' ? 'messenger-panel--mobile-hidden' : ''}`}>
          <div className="messenger-panel__header">
            <h2 className="messenger-panel__heading">Chats</h2>
            <button
              className="messenger-panel__new-btn"
              onClick={() => setShowNewChat(true)}
              title="New Chat"
            >
              <FiPlus />
            </button>
          </div>

          {loading ? (
            <div className="messenger-panel__loading">
              <Spinner />
            </div>
          ) : conversations.length === 0 ? (
            <div className="messenger-panel__empty">
              <div className="messenger-panel__empty-icon">💬</div>
              <p>No conversations yet</p>
              <button
                className="messenger-panel__start-btn"
                onClick={() => setShowNewChat(true)}
              >
                Start a Chat
              </button>
            </div>
          ) : (
            <div className="messenger-panel__conversations">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${conv.id === activeConversationId ? 'conversation-item--active' : ''} ${conv.unreadCount > 0 ? 'conversation-item--unread' : ''}`}
                  onClick={() => handleOpenConversation(conv.id)}
                >
                  <div className="conversation-item__avatar">
                    <Avatar src={conv.partner.profile_photo_url} name={conv.partner.full_name || ''} size="md" />
                    {conv.unreadCount > 0 && (
                      <span className="conversation-item__badge">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="conversation-item__content">
                    <div className="conversation-item__top">
                      <span className="conversation-item__name">{conv.partner.full_name}</span>
                      <span className="conversation-item__time">
                        {conv.lastMessage ? formatTime(conv.lastMessage.created_at) : formatTime(conv.created_at)}
                      </span>
                    </div>
                    <p className="conversation-item__preview">
                      {conv.lastMessage
                        ? (conv.lastMessage.sender_id === user.id ? 'You: ' : '') + conv.lastMessage.content
                        : 'Start chatting...'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Chat Panel ─── */}
        <div className={`messenger-panel messenger-panel--chat ${mobileView === 'list' ? 'messenger-panel--mobile-hidden' : ''}`}>
          {!activeConversationId ? (
            <div className="chat-empty">
              <div className="chat-empty__icon">✉️</div>
              <h3 className="chat-empty__title">Welcome to Pumiah Messenger</h3>
              <p className="chat-empty__text">Select a conversation or start a new chat to begin messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button className="chat-header__back" onClick={handleBackToList}>
                  <FiArrowLeft />
                </button>
                <Avatar
                  src={activeConversation?.partner.profile_photo_url}
                  name={activeConversation?.partner.full_name || ''}
                  size="sm"
                />
                <div className="chat-header__info">
                  <span className="chat-header__name">{activeConversation?.partner.full_name}</span>
                  <span className="chat-header__handle">@{activeConversation?.partner.username}</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="chat-messages">
                {messagesLoading ? (
                  <div className="chat-messages__loading">
                    <Spinner />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-messages__empty">
                    <p>Say hello to {activeConversation?.partner.full_name}! 👋</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isMine = msg.sender_id === user.id
                      const showDate = idx === 0 ||
                        new Date(msg.created_at).toDateString() !== new Date(messages[idx - 1].created_at).toDateString()

                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div className="chat-messages__date-divider">
                              <span>{getDateLabel(msg.created_at)}</span>
                            </div>
                          )}
                          <div className={`chat-bubble ${isMine ? 'chat-bubble--sent' : 'chat-bubble--received'}`}>
                            <div className="chat-bubble__content">
                              <p className="chat-bubble__text">{msg.content}</p>
                              <span className="chat-bubble__time">{formatMessageTime(msg.created_at)}</span>
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="chat-input">
                <input
                  ref={inputRef}
                  type="text"
                  className="chat-input__field"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  className={`chat-input__send ${messageInput.trim() ? 'chat-input__send--active' : ''}`}
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sending}
                >
                  <FiSend />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── New Chat Modal ─── */}
      {showNewChat && (
        <div className="new-chat-overlay" onClick={() => { setShowNewChat(false); setFriendSearch('') }}>
          <div className="new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-chat-modal__header">
              <h3>New Chat</h3>
              <button className="new-chat-modal__close" onClick={() => { setShowNewChat(false); setFriendSearch('') }}>
                <FiX />
              </button>
            </div>
            <div className="new-chat-modal__search">
              <FiSearch className="new-chat-modal__search-icon" />
              <input
                type="text"
                placeholder="Search friends..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="new-chat-modal__list">
              {filteredFriends.length === 0 ? (
                <p className="new-chat-modal__empty">
                  {friends.length === 0
                    ? 'Add friends first to start chatting!'
                    : 'No friends match your search'}
                </p>
              ) : (
                filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    className="new-chat-modal__item"
                    onClick={() => handleSelectFriend(friend.id)}
                  >
                    <Avatar src={friend.profile_photo_url} name={friend.full_name || ''} size="sm" />
                    <div className="new-chat-modal__item-info">
                      <span className="new-chat-modal__item-name">{friend.full_name}</span>
                      <span className="new-chat-modal__item-handle">@{friend.username}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
