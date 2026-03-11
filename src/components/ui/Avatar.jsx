import React from 'react'
import './Avatar.css'

export default function Avatar({ src, name = '', size = 'md', onClick, className = '' }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`avatar avatar--${size} ${onClick ? 'avatar--clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {src ? (
        <img src={src} alt={name} className="avatar__img" />
      ) : (
        <span className="avatar__initials">{initials || '?'}</span>
      )}
    </div>
  )
}
