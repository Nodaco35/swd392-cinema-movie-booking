import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { fetchShowtimesByMovieAndDate } from "../api/showtimes";
import { fetchCinemasForMovieAndDate } from "../api/cinemas";
import { useBooking } from "../context/BookingContext";

const S = {
  red: "#e31f26",
  bg: "#ffffff",
  card: "#f9f9f9",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
};

export default function ShowtimeSelectionPage() {
  const navigate = useNavigate();
  const { movie, date, cinema, showtime, setDate, setCinema, setShowtime } = useBooking();
  const [availableDates, setAvailableDates] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDates() {
      if (!movie) return;
      setLoading(true);
      setError("");
      try {
        const allForMovie = await fetchShowtimesByMovieAndDate({
          movieId: movie.movie_id,
          date: "",
        });
        const dates = Array.from(
          new Set(allForMovie.map((s) => s.start_time.slice(0, 10)))
        ).sort((a, b) => a.localeCompare(b));
        setAvailableDates(dates);
        if (!date && dates.length) setDate(dates[0]);
      } catch (err) {
        setError("Không thể tải lịch chiếu cho phim này.");
      } finally {
        setLoading(false);
      }
    }
    loadDates();
  }, [movie, date, setDate]);

  useEffect(() => {
    async function loadCinemas() {
      if (!movie || !date) return;
      setLoading(true);
      setError("");
      try {
        const result = await fetchCinemasForMovieAndDate({ movieId: movie.movie_id, date });
        setCinemas(result);
        if (!cinema && result.length) setCinema(result[0]);
      } catch (err) {
        setError("Không thể tải danh sách rạp.");
      } finally {
        setLoading(false);
      }
    }
    loadCinemas();
  }, [movie, date, cinema, setCinema]);

  useEffect(() => {
    async function loadShowtimes() {
      if (!movie || !date || !cinema) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchShowtimesByMovieAndDate({ movieId: movie.movie_id, date });
        const filtered = data.filter(
          (s) => Number(s.Auditorium.cinema_id) === Number(cinema.cinema_id)
        );
        setShowtimes(filtered);
      } catch (err) {
        setError("Không thể tải suất chiếu.");
      } finally {
        setLoading(false);
      }
    }
    loadShowtimes();
  }, [movie, date, cinema]);

  const formattedShowtimes = useMemo(
    () => showtimes.map((s) => ({
      ...s,
      startLabel: new Date(s.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
    [showtimes]
  );

  return (
    <PageShell
      title="Chọn Suất Chiếu"
      hint={movie ? `Chọn ngày, rạp và suất chiếu cho "${movie.title}".` : "Vui lòng chọn phim trước."}
    >
      {!movie && (
        <div style={{ color: "#dc2626", fontSize: 14, padding: "20px 0" }}>
          Chưa chọn phim. <Link to="/" style={{ color: S.red, fontWeight: 600 }}>Quay lại danh sách phim</Link>
        </div>
      )}

      {movie && (
        <>
          {error && (
            <div style={{ color: "#dc2626", fontSize: 14, marginBottom: 16 }}>{error}</div>
          )}

          {/* Movie info bar */}
          <div style={{
            display: "flex", gap: 20, alignItems: "center",
            marginBottom: 32, background: S.card,
            borderRadius: 10, padding: 20, border: `1px solid ${S.border}`,
          }}>
            <div style={{
              width: 70, height: 100, borderRadius: 6, flexShrink: 0,
              backgroundImage: movie.poster ? `url(${movie.poster})` : `linear-gradient(135deg, ${S.red}, #8b0000)`,
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
            <div>
              <div style={{ color: S.text, fontWeight: 800, fontSize: 18 }}>{movie.title}</div>
              <div style={{ color: S.textMuted, fontSize: 13, marginTop: 4 }}>
                {movie.duration ? `${movie.duration} phút` : ""}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
            {[["1", "Chọn Ngày"], ["2", "Chọn Rạp"], ["3", "Chọn Suất"]].map(([n, l], i) => {
              const stepDone = (i === 0 && date) || (i === 1 && cinema) || (i === 2 && showtime);
              const stepActive = (i === 0 && !date) || (i === 1 && date && !cinema) || (i === 2 && cinema && !showtime);
              return (
                <div key={n} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: stepDone || stepActive ? S.red : S.card,
                      border: `2px solid ${stepDone || stepActive ? S.red : S.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: stepDone || stepActive ? "#fff" : S.textMuted,
                      fontWeight: 800, fontSize: 14,
                    }}>{stepDone ? "✓" : n}</div>
                    <span style={{ color: stepDone || stepActive ? S.text : S.textMuted, fontWeight: stepActive ? 700 : 400, fontSize: 14 }}>{l}</span>
                  </div>
                  {i < 2 && <div style={{ width: 60, height: 2, background: stepDone ? S.red : S.border, margin: "0 12px" }} />}
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Left: Date + Cinema */}
            <div>
              <h3 style={{ color: S.text, marginBottom: 16, fontWeight: 800 }}>Chọn Ngày</h3>
              <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                {availableDates.map((d) => {
                  const dateObj = new Date(d);
                  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                  const isSelected = d === date;
                  return (
                    <div
                      key={d}
                      onClick={() => { setDate(d); setCinema(null); setShowtime(null); }}
                      style={{
                        textAlign: "center", padding: "10px 16px",
                        background: isSelected ? S.red : "#fff",
                        borderRadius: 8, cursor: "pointer",
                        border: `1px solid ${isSelected ? S.red : S.border}`,
                        minWidth: 70,
                      }}
                    >
                      <div style={{ color: isSelected ? "rgba(255,255,255,0.8)" : S.textMuted, fontSize: 11 }}>
                        {dayNames[dateObj.getDay()]}
                      </div>
                      <div style={{ color: isSelected ? "#fff" : S.text, fontWeight: 800, fontSize: 16 }}>{dateObj.getDate()}</div>
                      <div style={{ color: isSelected ? "rgba(255,255,255,0.8)" : S.textMuted, fontSize: 11 }}>
                        Th{dateObj.getMonth() + 1}
                      </div>
                    </div>
                  );
                })}
                {!availableDates.length && (
                  <span style={{ fontSize: 13, color: S.textMuted }}>Không có lịch chiếu.</span>
                )}
              </div>

              <h3 style={{ color: S.text, marginBottom: 16, fontWeight: 800 }}>Chọn Rạp</h3>
              {cinemas.map((c) => {
                const isSelected = cinema && c.cinema_id === cinema.cinema_id;
                return (
                  <div
                    key={c.cinema_id}
                    onClick={() => { setCinema(c); setShowtime(null); }}
                    style={{
                      padding: "14px 18px", borderRadius: 8, marginBottom: 8,
                      background: isSelected ? "rgba(227,31,38,0.08)" : "#fff",
                      border: `1px solid ${isSelected ? S.red : S.border}`,
                      cursor: "pointer", color: S.text, fontSize: 14,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <span>📍 {c.name}</span>
                    {isSelected && <span style={{ color: S.red, fontWeight: 700 }}>✓</span>}
                  </div>
                );
              })}
              {date && !cinemas.length && (
                <span style={{ fontSize: 13, color: S.textMuted }}>Không có rạp cho ngày này.</span>
              )}
            </div>

            {/* Right: Showtimes */}
            <div>
              <h3 style={{ color: S.text, marginBottom: 16, fontWeight: 800 }}>Suất Chiếu</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {formattedShowtimes.map((s) => {
                  const isSelected = showtime && s.showtime_id === showtime.showtime_id;
                  return (
                    <div
                      key={s.showtime_id}
                      onClick={() => setShowtime(s)}
                      style={{
                        padding: "12px 0", textAlign: "center",
                        background: isSelected ? S.red : "#fff",
                        border: `1px solid ${isSelected ? S.red : S.border}`,
                        borderRadius: 6, cursor: "pointer",
                        color: isSelected ? "#fff" : S.text,
                        fontWeight: 700, fontSize: 15,
                      }}
                    >
                      {s.startLabel}
                    </div>
                  );
                })}
              </div>
              {cinema && !formattedShowtimes.length && (
                <span style={{ fontSize: 13, color: S.textMuted }}>Không có suất chiếu cho rạp này.</span>
              )}
            </div>
          </div>

          {loading && (
            <div style={{ color: S.textMuted, fontSize: 13, marginTop: 16 }}>Đang tải...</div>
          )}

          <div style={{
            marginTop: 32, display: "flex", justifyContent: "space-between",
            alignItems: "center", gap: 12, flexWrap: "wrap",
          }}>
            <Link
              to={`/movies/${movie?.movie_id ?? ""}`}
              className="btn"
            >
              ← Quay Lại Phim
            </Link>
            <button
              className="btn btn-primary"
              type="button"
              disabled={!showtime}
              onClick={() => navigate("/seats/select")}
              style={!showtime ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              Tiếp Theo: Chọn Ghế →
            </button>
          </div>
        </>
      )}
    </PageShell>
  );
}
