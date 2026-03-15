import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../context/AuthContext'
import { fetchBookingById, fetchBookingHistoryByUser } from '../api/booking'
import { fetchTicketsByBooking } from '../api/tickets'
import { fetchPaymentTransactionsByBooking } from '../api/paymentTransactions'
import { fetchMovieById } from '../api/movies'
import { fetchCinemaById } from '../api/cinemas'
import { fetchShowtimeById } from '../api/showtimes'
import { fetchAuditoriumById } from '../api/auditorium'

export default function BookingConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    async function load() {
      if (!user) {
        navigate('/auth/login')
        return
      }

      setLoading(true)
      setError('')

      try {
        const userId = user?.user_id ?? user?.id
        let bookingId = location.state?.bookingId

        // Fallback: load most recent booking for this user if no id was passed.
        if (!bookingId) {
          const history = await fetchBookingHistoryByUser(userId)
          if (!history.length) {
            setError('We could not find a recent booking for your account.')
            setLoading(false)
            return
          }
          bookingId = history[0].booking_id
        }

        const booking = await fetchBookingById(bookingId)
        if (!booking || booking.user_id !== userId) {
          setError('This booking does not belong to your account.')
          setLoading(false)
          return
        }

        const [tickets, payments, movie, showtime] = await Promise.all([
          fetchTicketsByBooking(booking.booking_id),
          fetchPaymentTransactionsByBooking(booking.booking_id),
          fetchMovieById(booking.movie_id),
          fetchShowtimeById(booking.showtime_id),
        ])

        const auditorium = showtime?.auditorium_id
          ? await fetchAuditoriumById(showtime.auditorium_id)
          : null
        const cinema = auditorium?.cinema_id
          ? await fetchCinemaById(auditorium.cinema_id)
          : null

        const successfulPayment =
          payments.find((p) => p.status === 'success') || payments[0] || null

        const seatCount = tickets.length

        setSummary({
          booking,
          tickets,
          movie,
          showtime,
          cinema,
          payment: successfulPayment,
          seatCount,
        })
      } catch (err) {
        setError('Unable to load your booking confirmation right now.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [location.state, navigate, user])

  return (
    <PageShell
      title="Booking Confirmation"
      hint="Your booking has been processed. Below is your ticket summary."
    >
      {loading && (
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your booking...</div>
      )}

      {error && (
        <div style={{ color: '#ffb3b3', fontSize: 13, marginBottom: '0.75rem' }}>{error}</div>
      )}

      {summary && !loading && !error && (
        <>
          <section className="card" style={{ marginBottom: '0.9rem' }}>
            <h2
              style={{
                margin: 0,
                marginBottom: '0.4rem',
                fontSize: 16,
                letterSpacing: '-0.01em',
              }}
            >
              Booking #{summary.booking.booking_id}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', display: 'grid', gap: 4 }}>
              <span>
                Movie: <b>{summary.movie?.title}</b>
              </span>
              <span>
                Cinema: <b>{summary.cinema?.name}</b>
              </span>
              <span>
                Showtime:{' '}
                <b>
                  {new Date(summary.showtime?.start_time || summary.booking.booking_time).toLocaleString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </b>
              </span>
              <span>
                Seats: <b>{summary.seatCount}</b>
              </span>
              <span>
                Total paid: <b>${Number(summary.booking.total_price).toFixed(2)}</b>
              </span>
              <span>
                Status: <b>{summary.booking.status}</b>
              </span>
              <span>
                Payment method:{' '}
                <b>{summary.booking.payment_method || 'Not recorded'}</b>
              </span>
            </div>
          </section>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link className="btn" to="/booking/history">
              Go to Booking History
            </Link>
            <Link className="btn" to="/">
              Back to Home
            </Link>
          </div>
        </>
      )}
    </PageShell>
  )
}

