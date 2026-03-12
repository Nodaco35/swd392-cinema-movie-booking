import { apiClient } from './client'

export async function createBooking(payload) {
  // payload should at least contain: user_id, movie_id, showtime_id, cinema_id, auditorium_id, total_amount, status
  const response = await apiClient.post('/booking', payload)
  return response.data
}

export async function updateBookingStatus(bookingId, { status, promotion_code }) {
  const response = await apiClient.patch(`/booking/${bookingId}`, {
    status,
    promotion_code,
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
      _sort: 'created_at',
      _order: 'desc',
    },
  })
  return response.data
}

