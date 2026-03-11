import React from 'react'
import './Modal.css'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal--${size} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  )
}
