import React, { useState } from 'react'
import { FiCamera, FiSave, FiUser, FiMail, FiCalendar, FiMapPin } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Card from '../components/ui/Card'
import './SettingsPage.css'

export default function SettingsPage() {
  const { profile, updateProfile, uploadProfilePhoto, uploadCoverPhoto } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const { error: err } = await updateProfile({
      full_name: fullName.trim(),
      username: username.trim().toLowerCase(),
      bio: bio.trim(),
      location: location.trim(),
      date_of_birth: dateOfBirth || null,
    })

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (file) {
      const { error } = await uploadProfilePhoto(file)
      if (error) setError(error.message)
    }
  }

  async function handleCoverChange(e) {
    const file = e.target.files[0]
    if (file) {
      const { error } = await uploadCoverPhoto(file)
      if (error) setError(error.message)
    }
  }

  return (
    <div className="settings-page">
      <h1 className="settings-page__title">Settings</h1>

      <Card className="settings-page__card">
        <h3 className="settings-page__section-title">Profile Settings</h3>

        {error && <div className="settings-page__error">{error}</div>}
        {success && <div className="settings-page__success">Profile updated successfully!</div>}

        <form onSubmit={handleSave} className="settings-page__form">
          {/* Avatar */}
          <div className="settings-page__avatar-section">
            <label htmlFor="settings-avatar" className="settings-page__avatar-label">
              <Avatar src={profile?.profile_photo_url} name={profile?.full_name || ''} size="xl" />
              <div className="settings-page__avatar-overlay">
                <FiCamera />
              </div>
            </label>
            <input
              id="settings-avatar"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="visually-hidden"
            />
            <span className="settings-page__avatar-hint">Click to change avatar</span>
          </div>

          {/* Cover Photo */}
          <div className="settings-page__cover-section">
            <label htmlFor="settings-cover" className="settings-page__cover-label">
              {profile?.cover_photo_url ? (
                <img src={profile.cover_photo_url} alt="Cover" className="settings-page__cover-preview" />
              ) : (
                <div className="settings-page__cover-placeholder">
                  <FiCamera />
                  <span>Add Cover Photo</span>
                </div>
              )}
              <div className="settings-page__cover-overlay">
                <FiCamera />
              </div>
            </label>
            <input
              id="settings-cover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="visually-hidden"
            />
          </div>

          <Input
            id="settings-name"
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<FiUser />}
            required
          />

          <Input
            id="settings-username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<span>@</span>}
            required
          />

          <div className="input-group">
            <label htmlFor="settings-bio" className="input-group__label">Bio</label>
            <div className="input-group__wrapper" style={{ alignItems: 'flex-start' }}>
              <textarea
                id="settings-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write something about yourself..."
                className="input-group__input settings-page__bio"
                rows={3}
              />
            </div>
          </div>

          <Input
            id="settings-location"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            icon={<FiMapPin />}
          />

          <Input
            id="settings-dob"
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            icon={<FiCalendar />}
          />

          <Button type="submit" fullWidth loading={saving} icon={<FiSave />} size="lg">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
