import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'
import { useBooking } from '../context/BookingContext'
import { findPromotionByCode } from '../api/promotion'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const {
    movie,
    date,
    cinema,
    showtime,
    selectedSeatIds,
    promotion,
    setPromotion,
    subtotal,
    discount,
    total,
  } = useBooking()
  const [promoInput, setPromoInput] = useState('')
  const [promoStatus, setPromoStatus] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')

  const handleApplyPromotion = async (event) => {
    event.preventDefault()
    if (!promoInput.trim()) {
      setPromoStatus('Please enter a code first.')
      return
    }
    setApplyingPromo(true)
    setPromoStatus('')
    try {
      const promo = await findPromotionByCode(promoInput.trim())
      if (!promo) {
        setPromoStatus('That promotion code is not valid or is inactive.')
        setPromotion(null)
        return
      }
      setPromotion(promo)
      setPromoStatus(`Promotion "${promo.code}" applied.`)
    } catch (err) {
      setPromoStatus('Unable to validate this promotion right now.')
    } finally {
      setApplyingPromo(false)
    }
  }

  return (
    <PageShell
      title="Checkout"
      hint="Review your booking, apply a promotion, and choose a payment method."
    >
      {!movie || !showtime || !cinema || !selectedSeatIds.length ? (
        <div style={{ color: '#ffb3b3', fontSize: 14 }}>
          Your booking is not complete yet. Please choose a movie, showtime, and seats first.
        </div>
      ) : (
        <>
          {/* Summary */}
          <section className="card" style={{ marginBottom: '0.9rem' }}>
            <h2
              style={{
                margin: 0,
                marginBottom: '0.4rem',
                fontSize: 16,
                letterSpacing: '-0.01em',
              }}
            >
              Booking summary
            </h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', display: 'grid', gap: 4 }}>
              <span>
                Movie: <b>{movie.title}</b>
              </span>
              <span>
                Date: <b>{date}</b>
              </span>
              <span>
                Cinema: <b>{cinema.name}</b>
              </span>
              <span>
                Showtime:{' '}
                <b>{new Date(showtime.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b>
              </span>
              <span>
                Seats:{' '}
                <b>
                  {selectedSeatIds.length} seat
                  {selectedSeatIds.length !== 1 ? 's' : ''}
                </b>
              </span>
            </div>
          </section>

          {/* Promotion */}
          <section className="card" style={{ marginBottom: '0.9rem' }}>
            <h3
              style={{
                margin: 0,
                marginBottom: '0.4rem',
                fontSize: 14,
                letterSpacing: '-0.01em',
              }}
            >
              Promotion code
            </h3>
            <form
              onSubmit={handleApplyPromotion}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}
            >
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                style={{
                  minWidth: 140,
                  flex: '1 1 140px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  padding: '0.45rem 0.6rem',
                  background: 'rgba(3,8,23,0.9)',
                  color: 'var(--text)',
                  fontSize: 13,
                }}
              />
              <button className="btn" type="submit" disabled={applyingPromo}>
                {applyingPromo ? 'Applying...' : 'Apply'}
              </button>
            </form>
            {promoStatus && (
              <div
                style={{
                  marginTop: '0.4rem',
                  fontSize: 12,
                  color: promoStatus.includes('applied') ? 'var(--muted)' : '#ffb3b3',
                }}
              >
                {promoStatus}
              </div>
            )}
            <div style={{ marginTop: '0.4rem', fontSize: 12, color: 'var(--muted)' }}>
              Current promotion:{' '}
              <b>
                {promotion
                  ? `${promotion.code} (${Number(promotion.discount_percent || 0)}%)`
                  : 'none'}
              </b>
            </div>
          </section>

          {/* Totals + payment */}
          <section className="card">
            <h3
              style={{
                margin: 0,
                marginBottom: '0.4rem',
                fontSize: 14,
                letterSpacing: '-0.01em',
              }}
            >
              Payment
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                fontSize: 13,
                marginBottom: '0.6rem',
              }}
            >
              <div>
                Subtotal: <b>${subtotal.toFixed(2)}</b>
              </div>
              <div>
                Discount: <b>- ${discount.toFixed(2)}</b>
              </div>
              <div>
                Total: <b>${total.toFixed(2)}</b>
              </div>
            </div>

            <div style={{ marginBottom: '0.6rem', fontSize: 13 }}>
              <div style={{ marginBottom: 4 }}>Payment method</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPaymentMethod('card')}
                  style={
                    paymentMethod === 'card'
                      ? {
                          borderColor: 'rgba(234,240,255,0.6)',
                          background: 'rgba(255,255,255,0.04)',
                        }
                      : undefined
                  }
                >
                  Card
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPaymentMethod('momo')}
                  style={
                    paymentMethod === 'momo'
                      ? {
                          borderColor: 'rgba(234,240,255,0.6)',
                          background: 'rgba(255,255,255,0.04)',
                        }
                      : undefined
                  }
                >
                  Momo
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPaymentMethod('cash')}
                  style={
                    paymentMethod === 'cash'
                      ? {
                          borderColor: 'rgba(234,240,255,0.6)',
                          background: 'rgba(255,255,255,0.04)',
                        }
                      : undefined
                  }
                >
                  Cash
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <Link className="btn" to="/seats/select">
                Back to Seats
              </Link>
              <button
                className="btn"
                type="button"
                onClick={() => navigate('/payment', { state: { paymentMethod } })}
              >
                Proceed to Fake Payment
              </button>
            </div>
          </section>
        </>
      )}
    </PageShell>
  )
}
