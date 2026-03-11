import React from 'react'
import { Outlet } from 'react-router-dom'
import './AuthLayout.css'

export default function AuthLayout() {
  return (
    <div className="auth-layout bg-gradient-mesh">
      <div className="auth-layout__container animate-fade-in-up">
        <div className="auth-layout__logo">
          <div className="auth-layout__logo-icon">P</div>
          <h1 className="auth-layout__logo-text">Pumiah Social</h1>
          <p className="auth-layout__tagline">Connect. Share. Belong.</p>
        </div>
        <div className="auth-layout__card">
          <Outlet />
        </div>
      </div>
      <div className="auth-layout__orbs">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />
      </div>
    </div>
  )
}
