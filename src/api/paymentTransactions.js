import { apiClient } from './client'

export async function createPaymentTransaction(payload) {
  // payload: booking_id, user_id, amount, status, method, transaction_time, reference
  const response = await apiClient.post('/payment_transactions', payload)
  return response.data
}

export async function fetchPaymentTransactionsByBooking(bookingId) {
  const response = await apiClient.get('/payment_transactions', {
    params: { booking_id: bookingId },
  })
  return response.data
}

