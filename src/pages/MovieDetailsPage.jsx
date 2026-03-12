import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { fetchMovieById } from '../api/movies'
import { useBooking } from '../context/BookingContext'

export default function MovieDetailsPage() {
  const { movieId } = useParams()
  const navigate = useNavigate()
  const { setMovie } = useBooking()
  const [movie, setMovieState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchMovieById(movieId)
        if (isMounted) {
          setMovieState(data)
          setMovie(data)
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load movie details.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [movieId, setMovie])

  const statusLabel = movie
    ? (movie.release_date || '') > new Date().toISOString().slice(0, 10)
      ? 'Coming Soon'
      : 'Now Showing'
    : ''

  return (
    <PageShell
      title={movie ? movie.title : 'Movie Details'}
      hint="Review this movie and continue to choose a date, cinema, and showtime."
    >
      {loading && (
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading movie details...</div>
      )}
      {error && (
        <div style={{ color: '#ffb3b3', fontSize: 14, marginBottom: '0.75rem' }}>{error}</div>
      )}

      {movie && !loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              aria-hidden="true"
              style={{
                width: '100%',
                maxWidth: 260,
                aspectRatio: '2 / 3',
                borderRadius: 16,
                backgroundImage: movie.poster_url
                  ? `url(${movie.poster_url})`
                  : 'linear-gradient(135deg, #6aa3ff, #7c5cff)',
                backgroundSize: movie.poster_url ? 'cover' : '200% 200%',
                backgroundPosition: 'center',
              }}
            />
            {statusLabel && (
              <span
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                  fontSize: 12,
                }}
              >
                {statusLabel}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>
              {movie.genre} · {movie.rating} · {movie.language}
            </div>
            {movie.duration_minutes ? (
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                Duration: <b>{movie.duration_minutes} min</b>
              </div>
            ) : null}
            {movie.release_date ? (
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                Release date: <b>{movie.release_date}</b>
              </div>
            ) : null}

            {movie.description ? (
              <p style={{ marginTop: '0.25rem', fontSize: 14 }}>{movie.description}</p>
            ) : null}

            {movie.trailer_url && (
              <a
                href={movie.trailer_url}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{ width: 'fit-content', marginTop: '0.5rem' }}
              >
                Watch Trailer
              </a>
            )}

            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <button
                className="btn"
                type="button"
                onClick={() => navigate('/showtimes/select')}
              >
                Start Booking
              </button>
              <Link className="btn" to="/">
                Back to Movie List
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}

