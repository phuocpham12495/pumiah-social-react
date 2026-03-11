import React, { useState, useEffect } from 'react'
import { FiWifiOff } from 'react-icons/fi'
import './OfflineBanner.css'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="offline-banner animate-fade-in-down" role="alert">
      <FiWifiOff />
      <span>You're offline. Some features may be limited.</span>
    </div>
  )
}
