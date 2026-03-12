import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated, user } = useAuth()
  const { movie, showtime } = useBooking()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({ name, email, password })
      if (showtime) {
        navigate('/seats/select')
      } else if (movie) {
        navigate('/showtimes/select')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err?.message || 'Registration failed. Please check your details.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell
      title="Register"
      hint="Create a customer account to book tickets."
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
          <span style={{ marginBottom: 4 }}>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              borderRadius: 10,
              border: '1px solid var(--border)',
              padding: '0.5rem 0.6rem',
              background: 'rgba(3,8,23,0.9)',
              color: 'var(--text)',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
          <span style={{ marginBottom: 4 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              borderRadius: 10,
              border: '1px solid var(--border)',
              padding: '0.5rem 0.6rem',
              background: 'rgba(3,8,23,0.9)',
              color: 'var(--text)',
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
          <span style={{ marginBottom: 4 }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              borderRadius: 10,
              border: '1px solid var(--border)',
              padding: '0.5rem 0.6rem',
              background: 'rgba(3,8,23,0.9)',
              color: 'var(--text)',
            }}
          />
        </label>

        {error && (
          <div style={{ color: '#ffb3b3', fontSize: 13 }}>
            {error}
          </div>
        )}

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to="/auth/login" style={{ textDecoration: 'underline' }}>
            Sign in
          </Link>
        </div>

        <div style={{ marginTop: '0.5rem', color: 'rgba(234,240,255,0.72)', fontSize: 12 }}>
          Authenticated: <b>{String(isAuthenticated)}</b> {user ? `(as ${user.name})` : null}
        </div>
      </form>
    </PageShell>
  )
}

