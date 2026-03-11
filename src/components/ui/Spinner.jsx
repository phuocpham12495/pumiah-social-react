import React from 'react'
import './Spinner.css'

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div className={`spinner spinner--${size} ${className}`}>
      <div className="spinner__ring" />
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="page-spinner">
      <Spinner size="lg" />
    </div>
  )
}
