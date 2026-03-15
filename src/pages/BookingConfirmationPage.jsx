import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { fetchBookingById, fetchBookingHistoryByUser } from "../api/booking";
import { fetchTicketsByBooking } from "../api/tickets";
import { fetchPaymentTransactionsByBooking } from "../api/paymentTransactions";
import { fetchMovieById } from "../api/movies";
import { fetchCinemaById } from "../api/cinemas";
import { fetchShowtimeById } from "../api/showtimes";
import { fetchAuditoriumById } from "../api/auditorium";

const S = {
  red: "#e31f26",
  card: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
  green: "#22c55e",
};

export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function load() {
      if (!user) { navigate("/auth/login"); return; }

      setLoading(true);
      setError("");

      try {
        const userId = user?.user_id ?? user?.id;
        let bookingId = location.state?.bookingId;

        if (!bookingId) {
          const history = await fetchBookingHistoryByUser(userId);
          if (!history.length) {
            setError("Không tìm thấy đơn đặt vé nào.");
            setLoading(false);
            return;
          }
          bookingId = history[0].booking_id;
        }

        const booking = await fetchBookingById(bookingId);
        if (!booking || booking.user_id !== userId) {
          setError("Đơn đặt vé này không thuộc tài khoản của bạn.");
          setLoading(false);
          return;
        }

        const [tickets, payments, movie, showtime] = await Promise.all([
          fetchTicketsByBooking(booking.booking_id),
          fetchPaymentTransactionsByBooking(booking.booking_id),
          fetchMovieById(booking.movie_id),
          fetchShowtimeById(booking.showtime_id),
        ]);

        const auditorium = showtime?.auditorium_id
          ? await fetchAuditoriumById(showtime.auditorium_id)
          : null;
        const cinema = auditorium?.cinema_id
          ? await fetchCinemaById(auditorium.cinema_id)
          : null;

        const successfulPayment = payments.find((p) => p.status === "success") || payments[0] || null;

        setSummary({
          booking, tickets, movie, showtime, cinema,
          payment: successfulPayment,
          seatCount: tickets.length,
        });
      } catch (err) {
        setError("Không thể tải thông tin đặt vé.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location.state, navigate, user]);

  return (
    <PageShell title="Xác Nhận Đặt Vé" hint="Đặt vé thành công! Dưới đây là thông tin vé của bạn.">
      {loading && (
        <div style={{ textAlign: "center", color: S.textMuted, padding: 40 }}>Đang tải...</div>
      )}

      {error && (
        <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      {summary && !loading && !error && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            background: S.card, borderRadius: 12,
            border: `1px solid ${S.border}`, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            {/* Success header */}
            <div style={{ background: S.green, padding: "24px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>&#10003;</div>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>
                Đặt Vé Thành Công!
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>
                Mã đặt vé: #{summary.booking.booking_id}
              </div>
            </div>

            <div style={{ padding: 28 }}>
              {[
                ["Phim", summary.movie?.title || "N/A"],
                ["Rạp", summary.cinema?.name || "N/A"],
                ["Suất chiếu", new Date(summary.showtime?.start_time || summary.booking.booking_time).toLocaleString([], {
                  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
                })],
                ["Số ghế", summary.seatCount],
                ["Tổng tiền", `${Number(summary.booking.total_price).toLocaleString("vi-VN")}đ`],
                ["Trạng thái", summary.booking.status],
                ["Phương thức", summary.booking.payment_method || "N/A"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: `1px solid ${S.border}`,
                }}>
                  <span style={{ color: S.textMuted, fontSize: 14 }}>{k}</span>
                  <span style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>{v}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <Link
                  to="/booking/history"
                  style={{
                    flex: 1, textAlign: "center",
                    background: S.red, color: "#fff", border: "none",
                    borderRadius: 6, padding: "12px 0",
                    fontWeight: 800, fontSize: 14, textDecoration: "none",
                  }}
                >
                  Xem Lịch Sử
                </Link>
                <Link
                  to="/"
                  style={{
                    flex: 1, textAlign: "center",
                    background: "#f5f5f5", color: S.text, border: `1px solid ${S.border}`,
                    borderRadius: 6, padding: "12px 0",
                    fontWeight: 700, fontSize: 14, textDecoration: "none",
                  }}
                >
                  Về Trang Chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
