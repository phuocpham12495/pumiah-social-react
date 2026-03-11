import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const FriendsContext = createContext({})

export function useFriends() {
  return useContext(FriendsContext)
}

export default function FriendsProvider({ children }) {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchFriends = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      // Get friendships where user is either user1 or user2
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          id, created_at,
          user1:profiles!friendships_user1_id_fkey(id, full_name, username, profile_photo_url),
          user2:profiles!friendships_user2_id_fkey(id, full_name, username, profile_photo_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      if (error) throw error

      const friendList = (friendships || []).map(f => {
        const friend = f.user1.id === user.id ? f.user2 : f.user1
        return { ...friend, friendship_id: f.id, friendship_created_at: f.created_at }
      })
      setFriends(friendList)
    } catch (err) {
      console.error('Error fetching friends:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchFriendRequests = useCallback(async () => {
    if (!user) return
    try {
      // Received requests
      const { data: received } = await supabase
        .from('friend_requests')
        .select('*, sender:profiles!friend_requests_sender_id_fkey(id, full_name, username, profile_photo_url)')
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      setFriendRequests(received || [])

      // Sent requests
      const { data: sent } = await supabase
        .from('friend_requests')
        .select('*, receiver:profiles!friend_requests_receiver_id_fkey(id, full_name, username, profile_photo_url)')
        .eq('sender_id', user.id)
        .eq('status', 'pending')

      setSentRequests(sent || [])
    } catch (err) {
      console.error('Error fetching friend requests:', err)
    }
  }, [user])

  useEffect(() => {
    fetchFriends()
    fetchFriendRequests()
  }, [fetchFriends, fetchFriendRequests])

  async function sendRequest(receiverId) {
    const { data, error } = await supabase
      .from('friend_requests')
      .insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' })
      .select()
      .single()

    if (!error) {
      fetchFriendRequests()
    }
    return { data, error }
  }

  async function acceptRequest(requestId) {
    const { data, error } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select()
      .single()

    if (!error && data) {
      // Create friendship (ordered by IDs)
      const ids = [data.sender_id, data.receiver_id].sort()
      await supabase
        .from('friendships')
        .insert({ user1_id: ids[0], user2_id: ids[1] })

      fetchFriends()
      fetchFriendRequests()
    }
    return { data, error }
  }

  async function declineRequest(requestId) {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)

    if (!error) {
      fetchFriendRequests()
    }
    return { error }
  }

  async function removeFriend(friendUserId) {
    const ids = [user.id, friendUserId].sort()
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user1_id', ids[0])
      .eq('user2_id', ids[1])

    if (!error) {
      setFriends(prev => prev.filter(f => f.id !== friendUserId))
    }
    return { error }
  }

  function getFriendStatus(userId) {
    if (userId === user?.id) return 'self'
    if (friends.some(f => f.id === userId)) return 'friends'
    if (sentRequests.some(r => r.receiver_id === userId)) return 'request_sent'
    if (friendRequests.some(r => r.sender_id === userId)) return 'request_received'
    return 'none'
  }

  function isFriend(userId) {
    return friends.some(f => f.id === userId)
  }

  const value = {
    friends,
    friendRequests,
    sentRequests,
    loading,
    fetchFriends,
    fetchFriendRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    getFriendStatus,
    isFriend,
  }

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  )
}
