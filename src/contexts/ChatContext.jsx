import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ChatContext = createContext({})

export function useChat() {
  return useContext(ChatContext)
}

export default function ChatProvider({ children }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const messagesChannelRef = useRef(null)

  // ── Fetch all conversations with partner profile ──
  const fetchConversations = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id, last_message_at, created_at,
          user1:profiles!conversations_user1_id_fkey(id, full_name, username, profile_photo_url),
          user2:profiles!conversations_user2_id_fkey(id, full_name, username, profile_photo_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Attach partner profile & fetch last message + unread count per conversation
      const enriched = await Promise.all(
        (data || []).map(async (conv) => {
          const partner = conv.user1.id === user.id ? conv.user2 : conv.user1

          // Get last message
          const { data: lastMsgData } = await supabase
            .from('messages')
            .select('content, sender_id, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id)

          return {
            ...conv,
            partner,
            lastMessage: lastMsgData || null,
            unreadCount: count || 0,
          }
        })
      )

      setConversations(enriched)

      // Calculate total unread
      const totalUnread = enriched.reduce((sum, c) => sum + c.unreadCount, 0)
      setUnreadCount(totalUnread)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // ── Fetch messages for a conversation ──
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    setMessagesLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  // ── Open a conversation ──
  const openConversation = useCallback(async (conversationId) => {
    setActiveConversationId(conversationId)
    await fetchMessages(conversationId)
  }, [fetchMessages])

  // ── Send a message ──
  async function sendMessage(conversationId, content) {
    if (!content.trim() || !conversationId) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return { error }
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return { data }
  }

  // ── Start or find existing conversation with a friend ──
  async function startConversation(friendId) {
    const ids = [user.id, friendId].sort()

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user1_id', ids[0])
      .eq('user2_id', ids[1])
      .single()

    if (existing) {
      return { conversationId: existing.id }
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user1_id: ids[0], user2_id: ids[1] })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return { error }
    }

    // Refresh conversation list
    await fetchConversations()
    return { conversationId: data.id }
  }

  // ── Mark conversation as read ──
  async function markConversationRead(conversationId) {
    if (!conversationId) return

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    if (!error) {
      // Update local state
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      )
      setMessages(prev =>
        prev.map(m =>
          m.conversation_id === conversationId && m.sender_id !== user.id
            ? { ...m, is_read: true }
            : m
        )
      )
      // Recalculate total unread
      setUnreadCount(prev => {
        const conv = conversations.find(c => c.id === conversationId)
        return Math.max(0, prev - (conv?.unreadCount || 0))
      })
    }
  }

  // ── Load conversations on mount ──
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // ── Realtime: Subscribe to new messages for the active conversation ──
  useEffect(() => {
    if (!activeConversationId || !user) return

    // Clean up previous channel
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current)
    }

    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsg = payload.new
          // Only add if not already in the list (avoid duplicates from own sends)
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          // If message is from the other user, mark as read immediately (user is looking)
          if (newMsg.sender_id !== user.id) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
              .then(() => {})
          }
        }
      )
      .subscribe()

    messagesChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      messagesChannelRef.current = null
    }
  }, [activeConversationId, user])

  // ── Realtime: Subscribe to all new messages for unread count + conversation list updates ──
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`user-messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new
          // If it's from someone else and not in the active conversation, bump unread
          if (newMsg.sender_id !== user.id && newMsg.conversation_id !== activeConversationId) {
            setUnreadCount(prev => prev + 1)
            // Update conversation list
            setConversations(prev => {
              const updated = prev.map(c => {
                if (c.id === newMsg.conversation_id) {
                  return {
                    ...c,
                    lastMessage: { content: newMsg.content, sender_id: newMsg.sender_id, created_at: newMsg.created_at },
                    unreadCount: c.unreadCount + 1,
                    last_message_at: newMsg.created_at,
                  }
                }
                return c
              })
              // Sort by last_message_at
              return updated.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
            })
          } else if (newMsg.sender_id !== user.id && newMsg.conversation_id === activeConversationId) {
            // Update conversation list last message for active convo too
            setConversations(prev => {
              const updated = prev.map(c => {
                if (c.id === newMsg.conversation_id) {
                  return {
                    ...c,
                    lastMessage: { content: newMsg.content, sender_id: newMsg.sender_id, created_at: newMsg.created_at },
                    last_message_at: newMsg.created_at,
                  }
                }
                return c
              })
              return updated.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, activeConversationId])

  const value = {
    conversations,
    activeConversationId,
    messages,
    unreadCount,
    loading,
    messagesLoading,
    fetchConversations,
    openConversation,
    sendMessage,
    startConversation,
    markConversationRead,
    setActiveConversationId,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
