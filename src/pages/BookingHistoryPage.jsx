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
import { fetchAuditoriumsByIds } from '../api/auditorium'
import { fetchSeatsByAuditorium } from '../api/seats'

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
        const userId = user?.user_id ?? user?.id
        const bookings = await fetchBookingHistoryByUser(userId)
        if (!bookings.length) {
          setRows([])
          setLoading(false)
          return
        }

        const movieIds = bookings.map((b) => b.movie_id)
        const showtimeIds = bookings.map((b) => b.showtime_id)

        const [movies, showtimes] = await Promise.all([
          fetchMoviesByIds(movieIds),
          fetchShowtimesByIds(showtimeIds),
        ])

        const movieById = new Map(movies.map((m) => [m.movie_id, m]))
        const showtimeById = new Map(showtimes.map((s) => [s.showtime_id, s]))

        const auditoriumIds = Array.from(
          new Set(showtimes.map((s) => s.auditorium_id).filter(Boolean)),
        )
        const auditoriums = await fetchAuditoriumsByIds(auditoriumIds)
        const auditoriumById = new Map(
          auditoriums.map((a) => [a.auditorium_id, a]),
        )

        const cinemaIds = Array.from(
          new Set(auditoriums.map((a) => a.cinema_id).filter(Boolean)),
        )
        const cinemas = await fetchCinemasByIds(cinemaIds)
        const cinemaById = new Map(cinemas.map((c) => [c.cinema_id, c]))

        const seatLists = await Promise.all(
          auditoriumIds.map(async (auditoriumId) => ({
            auditoriumId,
            seats: await fetchSeatsByAuditorium(auditoriumId),
          })),
        )
        const seatLabelById = new Map()
        for (const entry of seatLists) {
          for (const seat of entry.seats) {
            seatLabelById.set(seat.seat_id, `${seat.row_name}${seat.seat_number}`)
          }
        }

        const enriched = await Promise.all(
          bookings.map(async (booking) => {
            const [tickets, payments] = await Promise.all([
              fetchTicketsByBooking(booking.booking_id),
              fetchPaymentTransactionsByBooking(booking.booking_id),
            ])
            const payment =
              payments.find((p) => p.status === 'success') || payments[0] || null

            const showtime = showtimeById.get(booking.showtime_id) || null
            const auditorium = showtime?.auditorium_id
              ? auditoriumById.get(showtime.auditorium_id) || null
              : null

            return {
              booking,
              movie: movieById.get(booking.movie_id) || null,
              cinema: auditorium?.cinema_id
                ? cinemaById.get(auditorium.cinema_id) || null
                : null,
              showtime,
              tickets,
              payment,
              seatLabelById,
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
        {rows.map(({ booking, movie, cinema, showtime, tickets, payment, seatLabelById }) => {
          const seatLabels = tickets.map(
            (t) => seatLabelById.get(t.seat_id) || String(t.seat_id),
          )
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
            <section key={booking.booking_id} className="card">
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
                    Booking #{booking.booking_id}
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
                  <b style={{ color: 'var(--text)' }}>{booking.payment_method || '—'}</b>
                </div>
                <div>
                  Total: <b style={{ color: 'var(--text)' }}>${Number(booking.total_price).toFixed(2)}</b>
                </div>
                <div>
                  Created:{' '}
                  <b style={{ color: 'var(--text)' }}>
                    {new Date(booking.booking_time).toLocaleString()}
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

