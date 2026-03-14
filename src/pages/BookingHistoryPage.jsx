import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../context/AuthContext'
import { fetchBookingHistoryByUser } from '../api/booking'
import { fetchTicketsByBooking } from '../api/tickets'
import { fetchPaymentTransactionsByBooking } from '../api/paymentTransactions'
import { fetchMoviesByIds } from '../api/movies'
import { fetchCinemasByIds } from '../api/cinemas'
import { fetchShowtimesByIds } from '../api/showtimes'

export default function BookingHistoryPage() {
  const navigate = useNavigate()
  const { user, initializing } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    async function load() {
      if (initializing) return
      if (!user) {
        navigate('/auth/login')
        return
      }

      setLoading(true)
      setError('')

      try {
        const bookings = await fetchBookingHistoryByUser(user.id)
        if (!bookings.length) {
          setRows([])
          setLoading(false)
          return
        }

        const movieIds = bookings.map((b) => b.movie_id)
        const cinemaIds = bookings.map((b) => b.cinema_id)
        const showtimeIds = bookings.map((b) => b.showtime_id)

        const [movies, cinemas, showtimes] = await Promise.all([
          fetchMoviesByIds(movieIds),
          fetchCinemasByIds(cinemaIds),
          fetchShowtimesByIds(showtimeIds),
        ])

        const movieById = new Map(movies.map((m) => [m.id, m]))
        const cinemaById = new Map(cinemas.map((c) => [c.id, c]))
        const showtimeById = new Map(showtimes.map((s) => [s.id, s]))

        const enriched = await Promise.all(
          bookings.map(async (booking) => {
            const [tickets, payments] = await Promise.all([
              fetchTicketsByBooking(booking.id),
              fetchPaymentTransactionsByBooking(booking.id),
            ])
            const payment =
              payments.find((p) => p.status === 'success') || payments[0] || null

            return {
              booking,
              movie: movieById.get(booking.movie_id) || null,
              cinema: cinemaById.get(booking.cinema_id) || null,
              showtime: showtimeById.get(booking.showtime_id) || null,
              tickets,
              payment,
            }
          }),
        )

        setRows(enriched)
      } catch (err) {
        setError('Unable to load your booking history right now.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initializing, navigate, user])

  const content = useMemo(() => {
    if (loading) {
      return <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your bookings...</div>
    }

    if (error) {
      return <div style={{ color: '#ffb3b3', fontSize: 13 }}>{error}</div>
    }

    if (!rows.length) {
      return (
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>
          No bookings yet. Start from the <Link to="/">movie list</Link>.
        </div>
      )
    }

    return (
      <div style={{ display: 'grid', gap: '0.9rem', marginTop: '0.75rem' }}>
        {rows.map(({ booking, movie, cinema, showtime, tickets, payment }) => {
          const seatLabels = tickets.map((t) => t.seat_label || String(t.seat_id))
          const startLabel = showtime?.start_time
            ? new Date(showtime.start_time).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—'

          return (
            <section key={booking.id} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                    Booking #{booking.id}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {movie?.title || 'Movie'} · {cinema?.name || 'Cinema'} · {startLabel}
                  </div>
                </div>

                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.15)',
                    fontSize: 12,
                  }}
                >
                  {booking.status}
                </span>
              </div>

              <div
                style={{
                  marginTop: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.5rem 1rem',
                  fontSize: 13,
                  color: 'var(--muted)',
                }}
              >
                <div>
                  Seats: <b style={{ color: 'var(--text)' }}>{seatLabels.join(', ') || '—'}</b>
                </div>
                <div>
                  Payment method:{' '}
                  <b style={{ color: 'var(--text)' }}>{payment?.method || '—'}</b>
                </div>
                <div>
                  Total: <b style={{ color: 'var(--text)' }}>${booking.total_amount.toFixed(2)}</b>
                </div>
                <div>
                  Created:{' '}
                  <b style={{ color: 'var(--text)' }}>
                    {new Date(booking.created_at).toLocaleString()}
                  </b>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    )
  }, [error, loading, rows])

  return (
    <PageShell
      title="Booking History"
      hint="Your previous bookings (customer only)."
    >
      {content}
    </PageShell>
  )
}

