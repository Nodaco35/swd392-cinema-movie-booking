import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useAuth } from '../context/AuthContext'
import { fetchBookingById, fetchBookingHistoryByUser } from '../api/booking'
import { fetchTicketsByBooking } from '../api/tickets'
import { fetchPaymentTransactionsByBooking } from '../api/paymentTransactions'
import { fetchMovieById } from '../api/movies'
import { fetchCinemaById } from '../api/cinemas'

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
        let bookingId = location.state?.bookingId

        // Fallback: load most recent booking for this user if no id was passed.
        if (!bookingId) {
          const history = await fetchBookingHistoryByUser(user.id)
          if (!history.length) {
            setError('We could not find a recent booking for your account.')
            setLoading(false)
            return
          }
          bookingId = history[0].id
        }

        const booking = await fetchBookingById(bookingId)
        if (!booking || booking.user_id !== user.id) {
          setError('This booking does not belong to your account.')
          setLoading(false)
          return
        }

        const [tickets, payments, movie, cinema] = await Promise.all([
          fetchTicketsByBooking(booking.id),
          fetchPaymentTransactionsByBooking(booking.id),
          fetchMovieById(booking.movie_id),
          fetchCinemaById(booking.cinema_id),
        ])

        const successfulPayment =
          payments.find((p) => p.status === 'success') || payments[0] || null

        const seatCount = tickets.length

        setSummary({
          booking,
          tickets,
          movie,
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
              Booking #{summary.booking.id}
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
                  {new Date(summary.booking.created_at).toLocaleString([], {
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
                Total paid: <b>${summary.booking.total_amount.toFixed(2)}</b>
              </span>
              <span>
                Status: <b>{summary.booking.status}</b>
              </span>
              <span>
                Payment method:{' '}
                <b>{summary.payment ? summary.payment.method : 'Not recorded'}</b>
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

