import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiMapPin, FiCalendar, FiEdit2 } from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useFriends } from '../contexts/FriendsContext'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PostCard from '../components/posts/PostCard'
import { PageSpinner } from '../components/ui/Spinner'
import './ProfilePage.css'

export default function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile: myProfile } = useAuth()
  const { friends, getFriendStatus, sendRequest, removeFriend, acceptRequest, friendRequests } = useFriends()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [profileFriends, setProfileFriends] = useState([])
  const [loading, setLoading] = useState(true)

  const isOwn = id === user?.id

  useEffect(() => {
    fetchProfileData()
  }, [id])

  async function fetchProfileData() {
    setLoading(true)
    try {
      // Fetch profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      setProfile(prof)

      // Fetch user's posts
      const { data: userPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, full_name, username, profile_photo_url),
          comments(id)
        `)
        .eq('profile_id', id)
        .order('created_at', { ascending: false })

      if (postsError) console.error('Posts error:', postsError)

      // Fetch likes separately (no FK between likes and posts)
      const postIds = (userPosts || []).map(p => p.id)
      let likesMap = {}
      if (postIds.length > 0) {
        const { data: allLikes } = await supabase
          .from('likes')
          .select('id, profile_id, target_id')
          .in('target_id', postIds)
          .eq('target_type', 'post')
        ;(allLikes || []).forEach(like => {
          if (!likesMap[like.target_id]) likesMap[like.target_id] = []
          likesMap[like.target_id].push(like)
        })
      }

      const postsWithLikes = (userPosts || []).map(post => ({
        ...post,
        likes: likesMap[post.id] || []
      }))
      setPosts(postsWithLikes)

      // Fetch user's friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select(`
          user1:profiles!friendships_user1_id_fkey(id, full_name, username, profile_photo_url),
          user2:profiles!friendships_user2_id_fkey(id, full_name, username, profile_photo_url)
        `)
        .or(`user1_id.eq.${id},user2_id.eq.${id}`)
        .limit(12)

      const friendList = (friendships || []).map(f =>
        f.user1.id === id ? f.user2 : f.user1
      )
      setProfileFriends(friendList)
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  async function handleFriendAction() {
    const status = getFriendStatus(id)
    if (status === 'none') {
      await sendRequest(id)
    } else if (status === 'friends') {
      if (window.confirm('Remove this friend?')) {
        await removeFriend(id)
      }
    } else if (status === 'request_received') {
      const req = friendRequests.find(r => r.sender_id === id)
      if (req) await acceptRequest(req.id)
    }
  }


  function handlePostDeleted(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (loading) return <PageSpinner />
  if (!profile) return <div className="page-empty">User not found.</div>

  const status = getFriendStatus(id)
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="profile-page animate-fade-in">
      {/* Cover Photo */}
      <div className="profile-page__cover">
        {profile.cover_photo_url ? (
          <img src={profile.cover_photo_url} alt="Cover" className="profile-page__cover-img" />
        ) : (
          <div className="profile-page__cover-placeholder" />
        )}
      </div>

      {/* Profile Info */}
      <div className="profile-page__info">
        <div className="profile-page__avatar-wrap">
          <Avatar src={profile.profile_photo_url} name={profile.full_name || ''} size="2xl" />
        </div>
        <div className="profile-page__details">
          <div className="profile-page__name-row">
            <div>
              <h1 className="profile-page__name">{profile.full_name}</h1>
              <p className="profile-page__username">@{profile.username}</p>
            </div>
            <div className="profile-page__actions">
              {isOwn ? (
                <Button variant="secondary" icon={<FiEdit2 />} onClick={() => navigate('/settings')}>
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant={status === 'friends' ? 'secondary' : status === 'request_sent' ? 'outline' : 'primary'}
                  onClick={handleFriendAction}
                  disabled={status === 'request_sent'}
                >
                  {status === 'none' && 'Add Friend'}
                  {status === 'request_sent' && 'Request Sent'}
                  {status === 'friends' && 'Remove Friend'}
                  {status === 'request_received' && 'Accept Request'}
                </Button>
              )}
            </div>
          </div>
          {profile.bio && <p className="profile-page__bio">{profile.bio}</p>}
          <div className="profile-page__meta-row">
            {profile.location && (
              <span className="profile-page__meta-item">
                <FiMapPin /> {profile.location}
              </span>
            )}
            <span className="profile-page__meta-item">
              <FiCalendar /> Joined {joinDate}
            </span>
            <span className="profile-page__meta-item">
              <strong>{profileFriends.length}</strong> friends
            </span>
          </div>
        </div>
      </div>

      <div className="profile-page__content">
        {/* Friends Grid */}
        <Card className="profile-page__friends-card">
          <h3 className="profile-page__section-title">Friends ({profileFriends.length})</h3>
          {profileFriends.length > 0 ? (
            <div className="profile-page__friends-grid">
              {profileFriends.map(f => (
                <div key={f.id} className="profile-page__friend-item" onClick={() => navigate(`/profile/${f.id}`)}>
                  <Avatar src={f.profile_photo_url} name={f.full_name || ''} size="md" />
                  <span className="profile-page__friend-name truncate">{f.full_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="profile-page__empty-text">No friends yet</p>
          )}
        </Card>

        {/* Posts */}
        <div className="profile-page__posts">
          <h3 className="profile-page__section-title" style={{ marginBottom: 'var(--space-4)' }}>Posts</h3>
          {posts.length === 0 ? (
            <Card><p className="profile-page__empty-text">No posts yet</p></Card>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} onDelete={handlePostDeleted} onUpdate={fetchProfileData} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
