import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import {
  fetchBookedSeatIdsForShowtime,
  fetchSeatsByAuditorium,
} from "../api/seats";
import { fetchHeldSeatIds, holdSeats } from "../api/seatHolds";

const S = {
  red: "#e31f26",
  card: "#f9f9f9",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
  green: "#22c55e",
  orange: "#f59e0b",
};

export default function SeatSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showtime, cinema, movie, selectedSeatIds, setSelectedSeatIds } =
    useBooking();

  const [seats, setSeats] = useState([]);
  const [bookedSeatIds, setBookedSeatIds] = useState([]);
  const [heldByOtherIds, setHeldByOtherIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const [error, setError] = useState("");

  const userId = user?.user_id ?? user?.id;
  const isUnmountedRef = useRef(false);

  // ── Load seats + booked + held-by-others on mount ──────────────────────
  useEffect(() => {
    isUnmountedRef.current = false;
    async function load() {
      if (!showtime) return;
      setLoading(true);
      setError("");
      try {
        const [allSeats, booked, held] = await Promise.all([
          fetchSeatsByAuditorium(showtime.auditorium_id),
          fetchBookedSeatIdsForShowtime(showtime.showtime_id),
          fetchHeldSeatIds(showtime.showtime_id, userId),
        ]);
        if (!isUnmountedRef.current) {
          setSeats(allSeats);
          setBookedSeatIds(booked);
          setHeldByOtherIds(held);
        }
      } catch {
        if (!isUnmountedRef.current) setError("Không thể tải sơ đồ ghế.");
      } finally {
        if (!isUnmountedRef.current) setLoading(false);
      }
    }
    load();
    return () => {
      isUnmountedRef.current = true;
    };
  }, [showtime, userId]);

  // ── Poll held-by-others every 3 s so the map stays current ─────────────
  useEffect(() => {
    if (!showtime || !userId) return;
    const interval = setInterval(async () => {
      try {
        const held = await fetchHeldSeatIds(showtime.showtime_id, userId);
        if (!isUnmountedRef.current) setHeldByOtherIds(held);
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showtime, userId]);

  // ── Derived data ────────────────────────────────────────────────────────
  const seatsByRow = useMemo(() => {
    const grouped = new Map();
    for (const seat of seats) {
      if (!grouped.has(seat.row_name)) grouped.set(seat.row_name, []);
      grouped.get(seat.row_name).push(seat);
    }
    for (const row of grouped.values())
      row.sort((a, b) => a.seat_number - b.seat_number);
    return Array.from(grouped.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [seats]);

  const vipRows = useMemo(() => {
    const rows = new Set();
    for (const [rowLabel, rowSeats] of seatsByRow)
      if (rowSeats.some((s) => s.type === "vip")) rows.add(rowLabel);
    return Array.from(rows);
  }, [seatsByRow]);

  // Seats that cannot be selected: paid tickets OR held by others
  const unavailableIds = useMemo(
    () => new Set([...bookedSeatIds, ...heldByOtherIds]),
    [bookedSeatIds, heldByOtherIds],
  );

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleToggleSeat = (seat) => {
    const id = seat.seat_id;
    if (unavailableIds.has(id)) return;
    setError("");
    if (selectedSeatIds.includes(id)) {
      setSelectedSeatIds(selectedSeatIds.filter((s) => s !== id));
    } else {
      if (selectedSeatIds.length >= 8) return;
      setSelectedSeatIds([...selectedSeatIds, id]);
    }
  };

  // Called when user clicks "Tiếp Theo →"
  // Creates a 10-minute hold THEN navigates to checkout
  const handleProceed = async () => {
    if (!selectedSeatIds.length || proceeding) return;
    setProceeding(true);
    setError("");
    try {
      const result = await holdSeats({
        userId,
        showtimeId: showtime.showtime_id,
        seatIds: selectedSeatIds,
      });
      // Pass holdUntil so CheckoutPage can show countdown
      navigate("/checkout", { state: { holdUntil: result.hold_until } });
    } catch (err) {
      if (err?.response?.status === 409) {
        const conflicting = err.response.data?.conflicting_seat_ids ?? [];
        setSelectedSeatIds((prev) =>
          prev.filter((id) => !conflicting.includes(id)),
        );
        setError(
          `${conflicting.length} ghế vừa được người khác đặt. Vui lòng chọn ghế khác.`,
        );
        // Refresh held list immediately
        try {
          const held = await fetchHeldSeatIds(showtime.showtime_id, userId);
          if (!isUnmountedRef.current) setHeldByOtherIds(held);
        } catch {
          // ignore
        }
      } else {
        setError("Không thể giữ ghế. Vui lòng thử lại.");
      }
      setProceeding(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <PageShell
      title="Chọn Ghế"
      hint={
        showtime
          ? `Chọn tối đa 8 ghế tại ${cinema?.name || "rạp đã chọn"}.`
          : "Vui lòng chọn suất chiếu trước."
      }
    >
      {!showtime && (
        <div style={{ color: "#dc2626", fontSize: 14 }}>
          Chưa chọn suất chiếu. Vui lòng quay lại.
        </div>
      )}

      {showtime && (
        <>
          {error && (
            <div
              style={{ color: "#dc2626", fontSize: 13, marginBottom: 16 }}
            >
              {error}
            </div>
          )}

          {/* Movie info bar */}
          {movie && (
            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                marginBottom: 24,
                background: S.card,
                borderRadius: 10,
                padding: 16,
                border: `1px solid ${S.border}`,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 70,
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundImage: movie.poster
                    ? `url(${movie.poster})`
                    : `linear-gradient(135deg, ${S.red}, #8b0000)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div>
                <div style={{ color: S.text, fontWeight: 700, fontSize: 15 }}>
                  {movie.title}
                </div>
                <div
                  style={{ color: S.textMuted, fontSize: 12, marginTop: 2 }}
                >
                  {cinema?.name} &bull;{" "}
                  {new Date(showtime.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Screen */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-block",
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 100%)",
                border: "2px solid #ccc",
                borderBottom: "none",
                borderRadius: "100px 100px 0 0",
                width: "65%",
                padding: "10px 0",
                color: S.textMuted,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 4,
              }}
            >
              MÀN HÌNH
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "center",
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            {[
              ["#f0f0f0", "#ccc", "Ghế thường"],
              ["rgba(227,31,38,0.1)", S.red, "Ghế VIP"],
              ["rgba(34,197,94,0.15)", S.green, "Đã chọn"],
              ["#e8e8e8", "#bbb", "Đã đặt"],
              ["rgba(245,158,11,0.15)", S.orange, "Đang giữ"],
            ].map(([bg, border, label]) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 3,
                    background: bg,
                    border: `1.5px solid ${border}`,
                  }}
                />
                <span style={{ color: S.textMuted, fontSize: 12 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Seat map */}
          {loading ? (
            <div
              style={{ textAlign: "center", color: S.textMuted, padding: 40 }}
            >
              Đang tải sơ đồ ghế...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <div
                style={{
                  minWidth: 500,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {seatsByRow.map(([rowLabel, rowSeats]) => {
                  const isVip = vipRows.includes(rowLabel);
                  return (
                    <div
                      key={rowLabel}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          color: S.textMuted,
                          width: 20,
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {rowLabel}
                      </span>
                      <div style={{ width: 14 }} />
                      {rowSeats.map((seat) => {
                        const booked = bookedSeatIds.includes(seat.seat_id);
                        const heldByOther = heldByOtherIds.includes(
                          seat.seat_id,
                        );
                        const selected = selectedSeatIds.includes(seat.seat_id);

                        let bg, borderColor, color, cursor, seatTitle;
                        if (booked) {
                          bg = "#e8e8e8";
                          borderColor = "#bbb";
                          color = "#aaa";
                          cursor = "not-allowed";
                          seatTitle = "Ghế đã được đặt";
                        } else if (heldByOther) {
                          bg = "rgba(245,158,11,0.15)";
                          borderColor = S.orange;
                          color = S.orange;
                          cursor = "not-allowed";
                          seatTitle = "Đang có người giữ (~10 phút)";
                        } else if (selected) {
                          bg = "rgba(34,197,94,0.2)";
                          borderColor = S.green;
                          color = S.green;
                          cursor = "pointer";
                          seatTitle = "Đã chọn – click để bỏ";
                        } else if (isVip) {
                          bg = "rgba(227,31,38,0.08)";
                          borderColor = S.red;
                          color = S.textMuted;
                          cursor = "pointer";
                          seatTitle = "Ghế VIP";
                        } else {
                          bg = "#f0f0f0";
                          borderColor = "#ccc";
                          color = S.textMuted;
                          cursor = "pointer";
                          seatTitle = "Ghế thường";
                        }

                        return (
                          <div
                            key={seat.seat_id}
                            onClick={() => handleToggleSeat(seat)}
                            title={seatTitle}
                            style={{
                              width: 34,
                              height: 32,
                              borderRadius: "5px 5px 3px 3px",
                              background: bg,
                              border: `1.5px solid ${borderColor}`,
                              cursor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              color,
                              transition: "all 0.1s",
                            }}
                          >
                            {seat.seat_number}
                          </div>
                        );
                      })}
                      <div style={{ width: 14 }} />
                      <span
                        style={{
                          color: S.textMuted,
                          width: 20,
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {rowLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary bar */}
          <div
            style={{
              marginTop: 32,
              background: S.card,
              borderRadius: 10,
              padding: "20px 28px",
              border: `1px solid ${S.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ color: S.textMuted, fontSize: 13 }}>
                Ghế đã chọn
              </div>
              <div style={{ color: S.text, fontWeight: 700, fontSize: 16 }}>
                {selectedSeatIds.length > 0
                  ? `${selectedSeatIds.length} ghế`
                  : "Chưa chọn ghế"}
              </div>
              {selectedSeatIds.length > 0 && (
                <div
                  style={{ color: S.orange, fontSize: 11, marginTop: 2 }}
                >
                  ⏱ Ghế sẽ được giữ 10 phút sau khi xác nhận
                </div>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: S.textMuted, fontSize: 13 }}>
                {cinema?.name}
              </div>
              <div style={{ color: S.text, fontWeight: 600 }}>
                {new Date(showtime.start_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link to="/showtimes/select" className="btn">
                ← Quay Lại
              </Link>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!selectedSeatIds.length || proceeding}
                onClick={handleProceed}
                style={
                  !selectedSeatIds.length || proceeding
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
              >
                {proceeding ? "Đang giữ ghế..." : "Tiếp Theo →"}
              </button>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
