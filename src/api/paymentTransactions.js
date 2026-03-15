import { apiClient } from './client'

export async function createPaymentTransaction(payload) {
  // payload: booking_id, amount, status, transaction_ref, request_id, paid_at, response_code, raw_response
  const response = await apiClient.post('/payment_transactions', payload)
  return response.data
}

export async function fetchPaymentTransactionsByBooking(bookingId) {
  const response = await apiClient.get('/payment_transactions', {
    params: { booking_id: bookingId },
  })
  return response.data
}

