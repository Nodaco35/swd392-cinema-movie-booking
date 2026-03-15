import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { fetchBookingHistoryByUser } from "../api/booking";
import { fetchTicketsByBooking } from "../api/tickets";
import { fetchPaymentTransactionsByBooking } from "../api/paymentTransactions";
import { fetchMoviesByIds } from "../api/movies";
import { fetchCinemasByIds } from "../api/cinemas";
import { fetchShowtimesByIds } from "../api/showtimes";
import { fetchAuditoriumsByIds } from "../api/auditorium";
import { fetchSeatsByAuditorium } from "../api/seats";

const S = {
  red: "#e31f26",
  card: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
  green: "#22c55e",
};

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      if (initializing) return;
      if (!user) { navigate("/auth/login"); return; }

      setLoading(true);
      setError("");

      try {
        const userId = user?.user_id ?? user?.id;
        const bookings = await fetchBookingHistoryByUser(userId);
        if (!bookings.length) {
          setRows([]);
          setLoading(false);
          return;
        }

        const movieIds = bookings.map((b) => b.movie_id);
        const showtimeIds = bookings.map((b) => b.showtime_id);

        const [movies, showtimes] = await Promise.all([
          fetchMoviesByIds(movieIds),
          fetchShowtimesByIds(showtimeIds),
        ]);

        const movieById = new Map(movies.map((m) => [m.movie_id, m]));
        const showtimeById = new Map(showtimes.map((s) => [s.showtime_id, s]));

        const auditoriumIds = Array.from(
          new Set(showtimes.map((s) => s.auditorium_id).filter(Boolean))
        );
        const auditoriums = await fetchAuditoriumsByIds(auditoriumIds);
        const auditoriumById = new Map(auditoriums.map((a) => [a.auditorium_id, a]));

        const cinemaIds = Array.from(
          new Set(auditoriums.map((a) => a.cinema_id).filter(Boolean))
        );
        const cinemas = await fetchCinemasByIds(cinemaIds);
        const cinemaById = new Map(cinemas.map((c) => [c.cinema_id, c]));

        const seatLists = await Promise.all(
          auditoriumIds.map(async (auditoriumId) => ({
            auditoriumId,
            seats: await fetchSeatsByAuditorium(auditoriumId),
          }))
        );
        const seatLabelById = new Map();
        for (const entry of seatLists) {
          for (const seat of entry.seats) {
            seatLabelById.set(seat.seat_id, `${seat.row_name}${seat.seat_number}`);
          }
        }

        const enriched = await Promise.all(
          bookings.map(async (booking) => {
            const [tickets, payments] = await Promise.all([
              fetchTicketsByBooking(booking.booking_id),
              fetchPaymentTransactionsByBooking(booking.booking_id),
            ]);
            const payment = payments.find((p) => p.status === "success") || payments[0] || null;
            const showtime = showtimeById.get(booking.showtime_id) || null;
            const auditorium = showtime?.auditorium_id
              ? auditoriumById.get(showtime.auditorium_id) || null
              : null;

            return {
              booking, movie: movieById.get(booking.movie_id) || null,
              cinema: auditorium?.cinema_id ? cinemaById.get(auditorium.cinema_id) || null : null,
              showtime, tickets, payment, seatLabelById,
            };
          })
        );

        setRows(enriched);
      } catch (err) {
        setError("Không thể tải lịch sử đặt vé.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initializing, navigate, user]);

  const content = useMemo(() => {
    if (loading) {
      return <div style={{ textAlign: "center", color: S.textMuted, padding: 40 }}>Đang tải lịch sử...</div>;
    }

    if (error) {
      return <div style={{ color: "#dc2626", fontSize: 13 }}>{error}</div>;
    }

    if (!rows.length) {
      return (
        <div style={{ textAlign: "center", color: S.textMuted, padding: 40 }}>
          Chưa có đơn đặt vé nào. <Link to="/" style={{ color: S.red }}>Đặt vé ngay</Link>
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 16 }}>
        {rows.map(({ booking, movie, cinema, showtime, tickets, payment, seatLabelById }) => {
          const seatLabels = tickets.map(
            (t) => seatLabelById.get(t.seat_id) || String(t.seat_id)
          );
          const startLabel = showtime?.start_time
            ? new Date(showtime.start_time).toLocaleString([], {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit",
              })
            : "—";

          const statusColors = {
            paid: S.green,
            cancelled: "#ef4444",
            pending: "#f59e0b",
          };

          return (
            <div key={booking.booking_id} style={{
              background: S.card, borderRadius: 10,
              border: `1px solid ${S.border}`, overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              {/* Card header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px",
                borderBottom: `1px solid ${S.border}`,
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: S.text }}>
                    Đơn #{booking.booking_id}
                  </div>
                  <div style={{ fontSize: 12, color: S.textMuted, marginTop: 2 }}>
                    {new Date(booking.booking_time).toLocaleString()}
                  </div>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: 999,
                  background: `${statusColors[booking.status] || "#777"}15`,
                  color: statusColors[booking.status] || "#777",
                  fontSize: 12, fontWeight: 700,
                  border: `1px solid ${statusColors[booking.status] || "#777"}`,
                }}>
                  {booking.status === "paid" ? "Đã thanh toán" : booking.status === "cancelled" ? "Đã hủy" : booking.status}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "8px 16px", fontSize: 13, color: S.textMuted,
                }}>
                  <div>Phim: <b style={{ color: S.text }}>{movie?.title || "N/A"}</b></div>
                  <div>Rạp: <b style={{ color: S.text }}>{cinema?.name || "N/A"}</b></div>
                  <div>Suất: <b style={{ color: S.text }}>{startLabel}</b></div>
                  <div>Ghế: <b style={{ color: S.text }}>{seatLabels.join(", ") || "—"}</b></div>
                  <div>Thanh toán: <b style={{ color: S.text }}>{booking.payment_method || "—"}</b></div>
                  <div>Tổng: <b style={{ color: S.red }}>{Number(booking.total_price).toLocaleString("vi-VN")}đ</b></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [error, loading, rows]);

  return (
    <PageShell title="Lịch Sử Đặt Vé" hint="Danh sách các đơn đặt vé của bạn.">
      {content}
    </PageShell>
  );
}
