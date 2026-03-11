import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useFriends } from '../contexts/FriendsContext'
import CreatePost from '../components/posts/CreatePost'
import PostCard from '../components/posts/PostCard'
import { PageSpinner } from '../components/ui/Spinner'
import './FeedPage.css'

export default function FeedPage() {
  const { user } = useAuth()
  const { friends } = useFriends()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const friendIds = friends.map(f => f.id)
      const allIds = [user.id, ...friendIds]

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_profile_id_fkey(id, full_name, username, profile_photo_url),
          likes(id, profile_id),
          comments(id)
        `)
        .in('profile_id', allIds)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }, [user, friends])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Realtime for new posts
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('public-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user, fetchPosts])

  function handlePostCreated() {
    fetchPosts()
  }

  function handlePostDeleted(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (loading) return <PageSpinner />

  return (
    <div className="feed-page">
      <h1 className="feed-page__title">Feed</h1>
      <CreatePost onPostCreated={handlePostCreated} />
      <div className="feed-page__posts">
        {posts.length === 0 ? (
          <div className="feed-page__empty">
            <p>No posts yet! Start by sharing something or adding friends.</p>
          </div>
        ) : (
          posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handlePostDeleted}
              onUpdate={fetchPosts}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))
        )}
      </div>
    </div>
  )
}
