import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import './AuthPages.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : signInError.message)
    } else {
      navigate('/feed')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <h2 className="auth-page__title">Welcome Back</h2>
      <p className="auth-page__subtitle">Sign in to continue to Pumiah Social</p>

      {error && <div className="auth-page__error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-page__form">
        <Input
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<FiMail />}
          required
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<FiLock />}
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      <p className="auth-page__footer">
        Don't have an account?{' '}
        <Link to="/signup" className="auth-page__link">Sign up</Link>
      </p>
    </div>
  )
}
