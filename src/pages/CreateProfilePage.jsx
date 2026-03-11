import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiFileText, FiCamera } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import './CreateProfilePage.css'

export default function CreateProfilePage() {
  const { user, updateProfile, uploadProfilePhoto } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !username.trim()) {
      setError('Name and username are required.')
      return
    }

    setLoading(true)
    try {
      // Create/update profile
      const { error: profileError } = await updateProfile({
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
      })

      if (profileError) throw profileError

      // Upload photo if selected
      if (photoFile) {
        const { error: photoError } = await uploadProfilePhoto(photoFile)
        if (photoError) console.error('Photo upload error:', photoError)
      }

      navigate('/feed')
    } catch (err) {
      setError(err.message || 'Failed to create profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-profile bg-gradient-mesh">
      <div className="create-profile__container animate-fade-in-up">
        <div className="create-profile__header">
          <h1 className="create-profile__title">Complete Your Profile</h1>
          <p className="create-profile__subtitle">Tell us about yourself to get started</p>
        </div>

        <div className="create-profile__card">
          {error && <div className="auth-page__error">{error}</div>}

          <form onSubmit={handleSubmit} className="create-profile__form">
            {/* Photo Upload */}
            <div className="create-profile__photo">
              <label htmlFor="profile-photo" className="create-profile__photo-label">
                <Avatar src={photoPreview} name={fullName} size="2xl" />
                <div className="create-profile__photo-overlay">
                  <FiCamera />
                  <span>Add Photo</span>
                </div>
              </label>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="visually-hidden"
              />
            </div>

            <Input
              id="create-name"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              icon={<FiUser />}
              required
            />

            <Input
              id="create-username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              icon={<span>@</span>}
              required
            />

            <div className="input-group">
              <label htmlFor="create-bio" className="input-group__label">Bio</label>
              <div className="input-group__wrapper" style={{ alignItems: 'flex-start' }}>
                <textarea
                  id="create-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  className="input-group__input create-profile__bio"
                  rows={3}
                />
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">
              Complete Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
