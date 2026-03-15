import { apiClient } from './client'

export async function createBooking(payload) {
  // payload should at least contain: user_id, movie_id, showtime_id, total_price, status
  const response = await apiClient.post('/booking', payload)
  return response.data
}

export async function updateBookingStatus(bookingId, { status, promotion_id }) {
  const response = await apiClient.patch(`/booking/${bookingId}`, {
    status,
    promotion_id,
  })
  return response.data
}

export async function fetchBookingById(bookingId) {
  const response = await apiClient.get(`/booking/${bookingId}`)
  return response.data
}

export async function fetchBookingHistoryByUser(userId) {
  // Include related info via filters only; actual joining is done on frontend.
  const response = await apiClient.get('/booking', {
    params: {
      user_id: userId,
      _sort: 'booking_time',
      _order: 'desc',
    },
  })
  return response.data
}

