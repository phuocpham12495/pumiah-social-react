import React, { useState } from 'react'
import { FiImage, FiLink, FiSend } from 'react-icons/fi'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Card from '../ui/Card'
import './CreatePost.css'

export default function CreatePost({ onPostCreated }) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('text')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [loading, setLoading] = useState(false)

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setPostType('image')
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (postType === 'image') setPostType('text')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() && !imageFile && !linkUrl.trim()) return

    setLoading(true)
    try {
      let mediaUrl = null
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('post_images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post_images')
          .getPublicUrl(fileName)
        mediaUrl = publicUrl
      }

      const { error } = await supabase.from('posts').insert({
        profile_id: user.id,
        post_type: postType,
        content: content.trim(),
        media_url: mediaUrl,
        link_url: postType === 'link' ? linkUrl.trim() : null,
      })

      if (error) throw error

      setContent('')
      setPostType('text')
      setImageFile(null)
      setImagePreview(null)
      setLinkUrl('')
      onPostCreated?.()
    } catch (err) {
      console.error('Error creating post:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="create-post">
      <form onSubmit={handleSubmit}>
        <div className="create-post__top">
          <Avatar src={profile?.profile_photo_url} name={profile?.full_name || ''} size="md" />
          <textarea
            className="create-post__input"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
        </div>

        {imagePreview && (
          <div className="create-post__preview">
            <img src={imagePreview} alt="Preview" />
            <button type="button" className="create-post__remove-img" onClick={removeImage}>✕</button>
          </div>
        )}

        {postType === 'link' && (
          <input
            type="url"
            className="create-post__link-input"
            placeholder="Paste a URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
        )}

        <div className="create-post__actions">
          <div className="create-post__types">
            <label className="create-post__type-btn" title="Add image">
              <FiImage />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="visually-hidden"
              />
            </label>
            <button
              type="button"
              className={`create-post__type-btn ${postType === 'link' ? 'create-post__type-btn--active' : ''}`}
              onClick={() => setPostType(postType === 'link' ? 'text' : 'link')}
              title="Add link"
            >
              <FiLink />
            </button>
          </div>
          <Button
            type="submit"
            size="sm"
            icon={<FiSend />}
            loading={loading}
            disabled={!content.trim() && !imageFile && !linkUrl.trim()}
          >
            Post
          </Button>
        </div>
      </form>
    </Card>
  )
}
