import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FiHome, FiUser, FiUsers, FiBell, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationsContext'
import Avatar from '../ui/Avatar'
import OfflineBanner from '../ui/OfflineBanner'
import './AppLayout.css'

export default function AppLayout() {
  const { user, profile, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/feed', icon: <FiHome />, label: 'Feed' },
    { to: `/profile/${user?.id}`, icon: <FiUser />, label: 'Profile' },
    { to: '/friends', icon: <FiUsers />, label: 'Friends' },
    { to: '/notifications', icon: <FiBell />, label: 'Notifications', badge: unreadCount },
    { to: '/settings', icon: <FiSettings />, label: 'Settings' },
  ]

  return (
    <div className="app-layout">
      <OfflineBanner />

      {/* Sidebar - Desktop */}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo" onClick={() => navigate('/feed')}>
            <div className="sidebar__logo-icon">P</div>
            <span className="sidebar__logo-text">Pumiah Social</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sidebar__link-icon">
                {item.icon}
                {item.badge > 0 && <span className="sidebar__badge">{item.badge > 9 ? '9+' : item.badge}</span>}
              </span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user" onClick={() => navigate(`/profile/${user?.id}`)}>
            <Avatar src={profile?.profile_photo_url} name={profile?.full_name || ''} size="sm" />
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{profile?.full_name || 'User'}</span>
              <span className="sidebar__user-handle">@{profile?.username || 'user'}</span>
            </div>
          </div>
          <button className="sidebar__signout" onClick={handleSignOut} title="Sign Out">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button className="mobile-header__toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <span className="mobile-header__title">Pumiah Social</span>
          <NavLink to="/notifications" className="mobile-header__notif">
            <FiBell />
            {unreadCount > 0 && <span className="mobile-header__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </NavLink>
        </header>

        <div className="main-content__inner">
          <Outlet />
        </div>
      </main>

      {/* Bottom Tab Bar - Mobile */}
      <nav className="bottom-tabs">
        {navItems.slice(0, 4).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-tabs__item ${isActive ? 'bottom-tabs__item--active' : ''}`}
          >
            <span className="bottom-tabs__icon">
              {item.icon}
              {item.badge > 0 && <span className="bottom-tabs__badge">{item.badge > 9 ? '9+' : item.badge}</span>}
            </span>
            <span className="bottom-tabs__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
