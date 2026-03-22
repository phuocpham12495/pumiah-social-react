import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUserCheck, FiUserX, FiUsers, FiSearch, FiUserPlus } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useFriends } from '../contexts/FriendsContext'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import './FriendsPage.css'

export default function FriendsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { friends, friendRequests, acceptRequest, declineRequest, removeFriend, sendRequest, getFriendStatus, loading } = useFriends()
  const [tab, setTab] = useState('friends')
  const [removingId, setRemovingId] = useState(null)
  const [removeError, setRemoveError] = useState('')

  // Find tab state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [suggested, setSuggested] = useState([])
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [sendingTo, setSendingTo] = useState(null)

  // Debounced search
  useEffect(() => {
    if (tab !== 'find') return
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_photo_url')
          .or(`username.ilike.%${query.trim()}%,full_name.ilike.%${query.trim()}%`)
          .neq('id', user.id)
          .limit(20)

        if (!error) setResults(data || [])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, tab, user])

  // Load suggested people when Find tab is opened
  useEffect(() => {
    if (tab !== 'find') return

    async function loadSuggested() {
      setLoadingSuggested(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, profile_photo_url')
          .neq('id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (!error) setSuggested(data || [])
      } catch (err) {
        console.error('Suggested error:', err)
      } finally {
        setLoadingSuggested(false)
      }
    }

    loadSuggested()
  }, [tab, user])

  async function handleSendRequest(userId) {
    setSendingTo(userId)
    await sendRequest(userId)
    setSendingTo(null)
  }

  function renderFriendAction(userId) {
    const status = getFriendStatus(userId)

    if (status === 'friends') {
      return (
        <Button variant="secondary" size="sm" disabled>
          <FiUserCheck /> Friends
        </Button>
      )
    }
    if (status === 'request_sent') {
      return (
        <Button variant="outline" size="sm" disabled>
          Request Sent
        </Button>
      )
    }
    if (status === 'request_received') {
      const req = friendRequests.find(r => r.sender_id === userId)
      return (
        <Button variant="primary" size="sm" icon={<FiUserCheck />} onClick={() => req && acceptRequest(req.id)}>
          Accept
        </Button>
      )
    }
    return (
      <Button
        variant="primary"
        size="sm"
        icon={<FiUserPlus />}
        loading={sendingTo === userId}
        onClick={() => handleSendRequest(userId)}
      >
        Add Friend
      </Button>
    )
  }

  const displayList = query.trim() ? results : suggested
  const isSearching = query.trim() ? searching : loadingSuggested

  return (
    <div className="friends-page">
      <h1 className="friends-page__title">Friends</h1>

      <div className="friends-page__tabs">
        <button
          className={`friends-page__tab ${tab === 'friends' ? 'friends-page__tab--active' : ''}`}
          onClick={() => setTab('friends')}
        >
          <FiUsers /> Friends ({friends.length})
        </button>
        <button
          className={`friends-page__tab ${tab === 'requests' ? 'friends-page__tab--active' : ''}`}
          onClick={() => setTab('requests')}
        >
          <FiUserCheck /> Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
        </button>
        <button
          className={`friends-page__tab ${tab === 'find' ? 'friends-page__tab--active' : ''}`}
          onClick={() => setTab('find')}
        >
          <FiSearch /> Find
        </button>
      </div>

      {/* Friends Tab */}
      {tab === 'friends' && (
        <div className="friends-page__list">
          {removeError && <div className="auth-page__error">{removeError}</div>}
          {friends.length === 0 ? (
            <Card><p className="friends-page__empty">No friends yet. Start connecting!</p></Card>
          ) : (
            friends.map(friend => (
              <Card key={friend.id} className="friends-page__item animate-fade-in">
                <div className="friends-page__item-left" onClick={() => navigate(`/profile/${friend.id}`)}>
                  <Avatar src={friend.profile_photo_url} name={friend.full_name || ''} size="md" />
                  <div>
                    <p className="friends-page__item-name">{friend.full_name}</p>
                    <p className="friends-page__item-handle">@{friend.username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<FiUserX />}
                  loading={removingId === friend.id}
                  onClick={async () => {
                    setRemoveError('')
                    setRemovingId(friend.id)
                    const { error } = await removeFriend(friend.id)
                    setRemovingId(null)
                    if (error) {
                      setRemoveError(error.message || 'Failed to remove friend.')
                    }
                  }}
                >
                  Remove
                </Button>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div className="friends-page__list">
          {friendRequests.length === 0 ? (
            <Card><p className="friends-page__empty">No pending friend requests.</p></Card>
          ) : (
            friendRequests.map(req => (
              <Card key={req.id} className="friends-page__item animate-fade-in">
                <div className="friends-page__item-left" onClick={() => navigate(`/profile/${req.sender.id}`)}>
                  <Avatar src={req.sender.profile_photo_url} name={req.sender.full_name || ''} size="md" />
                  <div>
                    <p className="friends-page__item-name">{req.sender.full_name}</p>
                    <p className="friends-page__item-handle">@{req.sender.username}</p>
                  </div>
                </div>
                <div className="friends-page__request-actions">
                  <Button variant="primary" size="sm" icon={<FiUserCheck />} onClick={() => acceptRequest(req.id)}>
                    Accept
                  </Button>
                  <Button variant="ghost" size="sm" icon={<FiUserX />} onClick={() => declineRequest(req.id)}>
                    Decline
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Find Tab */}
      {tab === 'find' && (
        <div className="friends-page__find">
          <div className="friends-page__search-bar">
            <FiSearch className="friends-page__search-icon" />
            <input
              type="text"
              className="friends-page__search-input"
              placeholder="Search by name or username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button className="friends-page__search-clear" onClick={() => setQuery('')}>✕</button>
            )}
          </div>

          {!query.trim() && (
            <p className="friends-page__find-label">Suggested People</p>
          )}
          {query.trim() && (
            <p className="friends-page__find-label">
              {searching ? 'Searching...' : `Results for "${query.trim()}"`}
            </p>
          )}

          {isSearching && displayList.length === 0 ? (
            <div className="friends-page__find-loading">
              <Spinner />
            </div>
          ) : displayList.length === 0 && query.trim() && !searching ? (
            <Card><p className="friends-page__empty">No users found matching "{query.trim()}"</p></Card>
          ) : (
            <div className="friends-page__list">
              {displayList.map(person => (
                <Card key={person.id} className="friends-page__item animate-fade-in">
                  <div className="friends-page__item-left" onClick={() => navigate(`/profile/${person.id}`)}>
                    <Avatar src={person.profile_photo_url} name={person.full_name || ''} size="md" />
                    <div>
                      <p className="friends-page__item-name">{person.full_name}</p>
                      <p className="friends-page__item-handle">@{person.username}</p>
                    </div>
                  </div>
                  {renderFriendAction(person.id)}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
