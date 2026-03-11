import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUserCheck, FiUserX, FiUsers } from 'react-icons/fi'
import { useFriends } from '../contexts/FriendsContext'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import './FriendsPage.css'

export default function FriendsPage() {
  const navigate = useNavigate()
  const { friends, friendRequests, acceptRequest, declineRequest, removeFriend, loading } = useFriends()
  const [tab, setTab] = useState('friends')

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
      </div>

      {tab === 'friends' && (
        <div className="friends-page__list">
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
                  onClick={() => {
                    if (window.confirm(`Remove ${friend.full_name} from friends?`)) {
                      removeFriend(friend.id)
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
    </div>
  )
}
