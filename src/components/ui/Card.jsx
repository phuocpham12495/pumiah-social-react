import React from 'react'
import './Card.css'

export default function Card({ children, className = '', padding = true, animate = false, onClick }) {
  return (
    <div
      className={`card ${padding ? 'card--padded' : ''} ${animate ? 'animate-fade-in-up' : ''} ${onClick ? 'card--clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
