import { apiClient } from './client'

export async function fetchSeatsByAuditorium(auditoriumId) {
  const response = await apiClient.get('/seats', {
    params: { auditorium_id: auditoriumId, _sort: 'row_label,seat_number' },
  })
  return response.data
}

export async function fetchBookedSeatIdsForShowtime(showtimeId) {
  // Get tickets for this showtime and return the occupied seat_ids
  const response = await apiClient.get('/tickets', {
    params: { showtime_id: showtimeId },
  })
  const tickets = response.data
  return Array.from(new Set(tickets.map((t) => t.seat_id)))
}

