import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import BookingConfirmationPage from '../pages/BookingConfirmationPage'
import BookingHistoryPage from '../pages/BookingHistoryPage'
import CheckoutPage from '../pages/CheckoutPage'
import FakePaymentPage from '../pages/FakePaymentPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import MovieDetailsPage from '../pages/MovieDetailsPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegisterPage from '../pages/RegisterPage'
import SeatSelectionPage from '../pages/SeatSelectionPage'
import ShowtimeSelectionPage from '../pages/ShowtimeSelectionPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
        <Route path="/showtimes/select" element={<ShowtimeSelectionPage />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        <Route path="/seats/select" element={<SeatSelectionPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<FakePaymentPage />} />

        <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
        <Route path="/booking/history" element={<BookingHistoryPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

