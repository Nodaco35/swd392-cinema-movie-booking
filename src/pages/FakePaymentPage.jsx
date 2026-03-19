import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { createBooking, updateBookingStatus } from "../api/booking"; //thêm mới
import { createTickets } from "../api/tickets";
import { createPaymentTransaction } from "../api/paymentTransactions";
import { fetchBookedSeatIdsForShowtime } from "../api/seats";
import { releaseHolds } from "../api/seatHolds";

const S = {
  red: "#e31f26",
  card: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
  green: "#22c55e",
  orange: "#f59e0b",
};

function HoldCountdown({ holdUntil }) {
  const [msLeft, setMsLeft] = useState(() =>
    holdUntil ? Math.max(0, new Date(holdUntil) - Date.now()) : 0,
  );
  useEffect(() => {
    if (!holdUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, new Date(holdUntil) - Date.now());
      setMsLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [holdUntil]);
  if (!holdUntil || msLeft === 0) return null;
  const totalSecs = Math.ceil(msLeft / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = (totalSecs % 60).toString().padStart(2, "0");
  const isUrgent = totalSecs <= 120;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 16px", borderRadius: 8, marginBottom: 16,
      background: isUrgent ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
      border: `1px solid ${isUrgent ? "#ef4444" : S.orange}`,
    }}>
      <span style={{ fontSize: 16 }}>{isUrgent ? "⚠️" : "⏱"}</span>
      <span style={{ fontSize: 13, color: isUrgent ? "#ef4444" : S.orange, fontWeight: 600 }}>
        Ghế được giữ trong <b>{m}:{s}</b> nữa!
      </span>
    </div>
  );
}

export default function FakePaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    movie, date, cinema, showtime, selectedSeatIds,
    promotion, subtotal, discount, total, resetBooking,
  } = useBooking();
  const initialMethod = location.state?.paymentMethod || "card";
  const holdUntil = location.state?.holdUntil ?? null;
  const [paymentMethod] = useState(initialMethod);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (success) => {
    if (!user) { navigate("/auth/login"); return; }
    if (!movie || !cinema || !showtime || !selectedSeatIds.length) {
      setError("Thông tin đặt vé không đầy đủ. Vui lòng quay lại.");
      return;
    }

    setSubmitting(true);
    setError("");

    const userId = user?.user_id ?? user?.id;
    if (holdUntil && new Date(holdUntil).getTime() <= Date.now()) {
      setError("Seat hold expired. Please reselect seats."); //thêm mới
      try {
        await releaseHolds({ userId, showtimeId: showtime.showtime_id });
      } catch {
        // best effort
      }
      setSubmitting(false);
      return;
    }

    try {
      if (success) {
        const alreadyBookedSeatIds = await fetchBookedSeatIdsForShowtime(showtime.showtime_id);
        const conflicts = selectedSeatIds.filter((id) => alreadyBookedSeatIds.includes(id));
        if (conflicts.length) {
          setError("Một số ghế đã được đặt. Vui lòng quay lại chọn ghế khác.");
          return;
        }

        const bookingPayload = {
          user_id: userId,
          movie_id: movie.movie_id,
          showtime_id: showtime.showtime_id,
          promotion_id: promotion?.promotion_id || null,
          booking_time: new Date(),
          status: "pending", //thêm mới
          payment_method: paymentMethod,
          total_price: total,
        };
        const booking = await createBooking(bookingPayload);

        const ticketsPayload = selectedSeatIds.map((seatId) => ({
          booking_id: booking.booking_id,
          seat_id: seatId,
          price: subtotal / selectedSeatIds.length || 0,
        }));
        await createTickets(ticketsPayload);

        await createPaymentTransaction({
          booking_id: booking.booking_id,
          amount: total,
          status: "success",
          transaction_ref: `FAKE-${booking.booking_id}-OK`,
          request_id: `REQ-${booking.booking_id}`,
          response_code: "00",
          paid_at: new Date(),
          raw_response: JSON.stringify({ provider: paymentMethod, message: "Success" }),
        });
        await updateBookingStatus(booking.booking_id, {
          status: "confirmed",
          promotion_id: promotion?.promotion_id || null,
        }); //thêm mới

        // Release holds (seats are now booked via tickets)
        try {
          await releaseHolds({ userId, showtimeId: showtime.showtime_id });
        } catch {
          // best effort
        }
        resetBooking();
        navigate("/booking/confirmation", { state: { bookingId: booking.booking_id } });
      } else {
        const bookingPayload = {
          user_id: userId,
          movie_id: movie.movie_id,
          showtime_id: showtime.showtime_id,
          promotion_id: promotion?.promotion_id || null,
          booking_time: new Date(),
          status: "pending", //thêm mới
          payment_method: paymentMethod,
          total_price: total,
        };
        const booking = await createBooking(bookingPayload);

        await createPaymentTransaction({
          booking_id: booking.booking_id,
          amount: total,
          status: "failed",
          transaction_ref: `FAKE-${booking.booking_id}-FAIL`,
          request_id: `REQ-${booking.booking_id}`,
          response_code: "99",
          paid_at: null,
          raw_response: JSON.stringify({ provider: paymentMethod, message: "Failed" }),
        });
        await updateBookingStatus(booking.booking_id, {
          status: "cancelled",
          promotion_id: promotion?.promotion_id || null,
        }); //thêm mới

        setError("Thanh toán thất bại. Bạn có thể thử lại.");
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setError("Some seats are no longer available. Please choose again."); //thêm mới
      } else if (err?.response?.status === 400) {
        setError(err?.response?.data?.message || "Invalid booking data."); //thêm mới
      } else {
        setError("Something went wrong while processing your booking. Please try again."); //thêm mới
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Thanh Toán Demo" hint="Đây là bước thanh toán giả lập cho mục đích demo.">
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{
          background: S.card, borderRadius: 12,
          border: `1px solid ${S.border}`, overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ background: S.red, padding: "20px 28px" }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>
              Xử Lý Thanh Toán
            </div>
          </div>

          <div style={{ padding: 28 }}>
            <HoldCountdown holdUntil={holdUntil} />
            <div style={{ color: S.textMuted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Chọn kết quả thanh toán bên dưới. Đây là thanh toán giả lập, không trừ tiền thật.
            </div>

            {/* Summary */}
            {movie && (
              <div style={{
                background: "#f9f9f9", borderRadius: 8, padding: 16,
                border: `1px solid ${S.border}`, marginBottom: 24,
              }}>
                <div style={{ color: S.text, fontWeight: 700, marginBottom: 4 }}>{movie.title}</div>
                <div style={{ color: S.textMuted, fontSize: 13 }}>
                  {cinema?.name} &bull; {selectedSeatIds.length} ghế &bull; Tổng: {total.toLocaleString("vi-VN")}đ
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                style={{
                  flex: 1, background: S.green, color: "#fff", border: "none",
                  borderRadius: 6, padding: "14px 0",
                  fontWeight: 800, fontSize: 15, cursor: "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Đang xử lý..." : "Thanh Toán Thành Công"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                style={{
                  flex: 1, background: "#f5f5f5", color: S.text, border: `1px solid ${S.border}`,
                  borderRadius: 6, padding: "14px 0",
                  fontWeight: 700, fontSize: 15, cursor: "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                Thất Bại
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 16, color: "#dc2626", fontSize: 13, textAlign: "center" }}>{error}</div>
            )}

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link to="/checkout" style={{ color: S.textMuted, fontSize: 13 }}>
                ← Quay lại thanh toán
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
