import { Link } from 'react-router-dom'

function formatDuration(minutes) {
  if (!minutes) return ''
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (!hrs) return `${mins} min`
  if (!mins) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

function deriveStatus(releaseDate) {
  if (!releaseDate) return 'Now Showing'
  const today = new Date().toISOString().slice(0, 10)
  if (releaseDate > today) return 'Coming Soon'
  return 'Now Showing'
}

export function MovieCard({ movie }) {
  const status = deriveStatus(movie.release_date)
  const duration = formatDuration(movie.duration_minutes)

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        height: '100%',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
      }}
    >
      <Link
        to={`/movies/${movie.id}`}
        style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex' }}
      >
        <div style={{ display: 'flex', gap: '0.9rem' }}>
          <div
            aria-hidden="true"
            style={{
              width: 76,
              height: 102,
              borderRadius: 10,
              backgroundImage: movie.poster_url
                ? `url(${movie.poster_url})`
                : 'linear-gradient(135deg, #6aa3ff, #7c5cff)',
              backgroundSize: movie.poster_url ? 'cover' : '200% 200%',
              backgroundPosition: 'center',
              flexShrink: 0,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              {movie.title}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {movie.genre} · {movie.rating} · {movie.language}
            </div>
            {duration ? (
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{duration}</div>
            ) : null}
          </div>
        </div>
      </Link>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          marginTop: '0.25rem',
        }}
      >
        <span
          style={{
            padding: '0.2rem 0.6rem',
            borderRadius: 999,
            border: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          {status}
        </span>
        <Link className="btn" to={`/movies/${movie.id}`}>
          View Details
        </Link>
      </div>
    </article>
  )
}

