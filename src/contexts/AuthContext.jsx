import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      setProfile(data || null)
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setProfileLoading(false)
      setLoading(false)
    }
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    setProfile(null)
    return { error }
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates })
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    }
    return { data, error }
  }

  async function uploadProfilePhoto(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/profile.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('profile_photos')
      .upload(fileName, file, { upsert: true })

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
      .from('profile_photos')
      .getPublicUrl(fileName)

    return await updateProfile({ profile_photo_url: publicUrl })
  }

  async function uploadCoverPhoto(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/cover.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('profile_photos')
      .upload(fileName, file, { upsert: true })

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
      .from('profile_photos')
      .getPublicUrl(fileName)

    return await updateProfile({ cover_photo_url: publicUrl })
  }

  const value = {
    session,
    user,
    profile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadProfilePhoto,
    uploadCoverPhoto,
    fetchProfile: () => user && fetchProfile(user.id),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
