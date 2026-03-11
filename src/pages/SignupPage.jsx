import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiLock, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import './AuthPages.css'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email, password)

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('This email address is already registered.')
      } else {
        setError(signUpError.message)
      }
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-page auth-page--success">
        <div className="auth-page__success-icon">
          <FiCheckCircle />
        </div>
        <h2 className="auth-page__title">Check Your Email</h2>
        <p className="auth-page__subtitle">
          We've sent a confirmation link to <strong>{email}</strong>. 
          Click the link to verify your account.
        </p>
        <Link to="/login">
          <Button variant="secondary" fullWidth>Back to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <h2 className="auth-page__title">Create Account</h2>
      <p className="auth-page__subtitle">Join Pumiah Social and connect with friends</p>

      {error && <div className="auth-page__error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-page__form">
        <Input
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={<FiMail />}
          required
        />
        <Input
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 6 characters"
          icon={<FiLock />}
          required
        />
        <Input
          id="signup-confirm"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          icon={<FiLock />}
          required
        />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign Up
        </Button>
      </form>

      <p className="auth-page__footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-page__link">Sign in</Link>
      </p>
    </div>
  )
}
