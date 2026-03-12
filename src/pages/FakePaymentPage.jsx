import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { createBooking } from "../api/booking";
import { createTickets } from "../api/tickets";
import { createPaymentTransaction } from "../api/paymentTransactions";
import { fetchBookedSeatIdsForShowtime } from "../api/seats";

export default function FakePaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    movie,
    date,
    cinema,
    showtime,
    selectedSeatIds,
    promotion,
    subtotal,
    discount,
    total,
    resetBooking,
  } = useBooking();
  const initialMethod = location.state?.paymentMethod || "fake_card";
  const [paymentMethod] = useState(initialMethod);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (success) => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    if (!movie || !cinema || !showtime || !selectedSeatIds.length) {
      setError(
        "Your booking information is incomplete. Please go back to checkout.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (success) {
        // 1) Final conflict check – only bother when we intend to reserve seats
        const alreadyBookedSeatIds = await fetchBookedSeatIdsForShowtime(
          showtime.id,
        );
        const conflicts = selectedSeatIds.filter((id) =>
          alreadyBookedSeatIds.includes(id),
        );
        if (conflicts.length) {
          setError(
            "Some of the seats you selected have just been booked. Please go back and choose different seats.",
          );
          return;
        }

        // 2) Create booking
        const bookingPayload = {
          user_id: user.id,
          movie_id: movie.id,
          showtime_id: showtime.id,
          cinema_id: cinema.id,
          auditorium_id: showtime.auditorium_id,
          total_amount: total,
          status: "completed",
          promotion_code: promotion?.code || null,
          created_at: new Date().toISOString(),
        };
        const booking = await createBooking(bookingPayload);

        // 3) Create tickets for each selected seat
        const ticketsPayload = selectedSeatIds.map((seatId) => ({
          booking_id: booking.id,
          user_id: user.id,
          movie_id: movie.id,
          showtime_id: showtime.id,
          cinema_id: cinema.id,
          auditorium_id: showtime.auditorium_id,
          seat_id: seatId,
          // seat_label will be derived later from seats data if needed
          price: subtotal / selectedSeatIds.length || 0,
        }));
        await createTickets(ticketsPayload);

        // 4) Create payment transaction
        await createPaymentTransaction({
          booking_id: booking.id,
          user_id: user.id,
          amount: total,
          status: "success",
          method: paymentMethod,
          transaction_time: new Date().toISOString(),
          reference: `FAKE-${booking.id}-OK`,
        });

        resetBooking();
        navigate("/booking/confirmation", { state: { bookingId: booking.id } });
      } else {
        // simulate a failure without reserving seats
        const bookingPayload = {
          user_id: user.id,
          movie_id: movie.id,
          showtime_id: showtime.id,
          cinema_id: cinema.id,
          auditorium_id: showtime.auditorium_id,
          total_amount: total,
          status: "payment_failed",
          promotion_code: promotion?.code || null,
          created_at: new Date().toISOString(),
        };
        const booking = await createBooking(bookingPayload);

        await createPaymentTransaction({
          booking_id: booking.id,
          user_id: user.id,
          amount: total,
          status: "failed",
          method: paymentMethod,
          transaction_time: new Date().toISOString(),
          reference: `FAKE-${booking.id}-FAIL`,
        });

        setError("Payment failed. You can try again or adjust your booking.");
      }
    } catch (err) {
      setError(
        "Something went wrong while processing your booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title="Fake Payment"
      hint="This is a fake payment step for demo purposes."
    >
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          className="btn"
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit(true)}
        >
          {submitting ? "Processing..." : "Pay Successfully"}
        </button>
        <button
          className="btn"
          type="button"
          disabled={submitting}
          onClick={() => handleSubmit(false)}
        >
          Fail Payment
        </button>
        <Link className="btn" to="/checkout">
          Back to Checkout
        </Link>
      </div>
      {error && (
        <div style={{ marginTop: "0.75rem", color: "#ffb3b3", fontSize: 13 }}>
          {error}
        </div>
      )}
    </PageShell>
  );
}
