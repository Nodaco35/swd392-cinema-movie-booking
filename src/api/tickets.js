import { apiClient } from './client'

export async function createTickets(tickets) {
  // json-server does not support bulk create by default, so send multiple POSTs
  const created = []
  // Use for..of to keep order and make error handling simpler
  for (const ticket of tickets) {
    const response = await apiClient.post('/tickets', ticket)
    created.push(response.data)
  }
  return created
}

export async function fetchTicketsByBooking(bookingId) {
  const response = await apiClient.get('/tickets', {
    params: { booking_id: bookingId },
  })
  return response.data
}

