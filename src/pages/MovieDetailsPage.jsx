import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchMovieById } from "../api/movies";
import { useBooking } from "../context/BookingContext";

const S = {
  red: "#e31f26",
  bg: "#ffffff",
  card: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textSub: "#555",
  textMuted: "#777",
  gold: "#f5c518",
};

function RatingBadge({ rating }) {
  const colors = { P: "#22c55e", T13: "#f59e0b", T18: "#ef4444", C18: "#7c3aed" };
  return (
    <span style={{
      background: colors[rating] || S.red,
      color: "#fff", fontSize: 10, fontWeight: 800,
      padding: "2px 6px", borderRadius: 3, letterSpacing: 0.5,
    }}>{rating || "P"}</span>
  );
}

export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { setMovie } = useBooking();
  const [movie, setMovieState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchMovieById(movieId);
        if (isMounted) {
          setMovieState(data);
          setMovie(data);
        }
      } catch (err) {
        if (isMounted) setError("Không thể tải thông tin phim.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [movieId, setMovie]);

  if (loading) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: S.textMuted }}>Đang tải thông tin phim...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#dc2626", marginBottom: 16 }}>{error || "Không tìm thấy phim"}</div>
          <Link to="/" style={{ color: S.red }}>Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  const posterUrl = movie.poster;
  const statusLabel = movie.status === "upcoming" ? "Sắp Chiếu" : movie.status === "ended" ? "Đã Kết Thúc" : "Đang Chiếu";

  return (
    <div style={{ background: S.bg, minHeight: "100vh" }}>
      {/* Banner */}
      <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
        <div style={{
          width: "100%", height: "100%",
          backgroundImage: posterUrl ? `url(${posterUrl})` : `linear-gradient(135deg, ${S.red}, #8b0000)`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(2px)",
          transform: "scale(1.05)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "flex-end",
          padding: "40px 80px",
        }}>
          <div style={{ display: "flex", gap: 32, alignItems: "flex-end", maxWidth: 1280, width: "100%", margin: "0 auto" }}>
            <div style={{
              width: 180, height: 260, borderRadius: 8,
              border: `3px solid ${S.red}`, flexShrink: 0, overflow: "hidden",
              backgroundImage: posterUrl ? `url(${posterUrl})` : `linear-gradient(135deg, ${S.red}, #8b0000)`,
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <RatingBadge rating={movie.rating} />
                <span style={{
                  background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11,
                  fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                }}>{statusLabel}</span>
              </div>
              <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 900, margin: "0 0 4px" }}>
                {movie.title}
              </h1>
              <div style={{ display: "flex", gap: 20, color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 16, flexWrap: "wrap" }}>
                {movie.duration && <span>⏱ {movie.duration} phút</span>}
                {movie.release_date && <span>📅 {movie.release_date}</span>}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => navigate("/showtimes/select")}
                  style={{
                    background: S.red, color: "#fff", border: "none",
                    borderRadius: 6, padding: "12px 32px",
                    fontWeight: 800, fontSize: 15, cursor: "pointer",
                  }}
                >
                  MUA VÉ NGAY
                </button>
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "rgba(255,255,255,0.15)", color: "#fff",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: 6, padding: "12px 24px",
                      fontWeight: 600, fontSize: 15, cursor: "pointer",
                      textDecoration: "none", display: "inline-flex", alignItems: "center",
                    }}
                  >
                    ▶ Trailer
                  </a>
                )}
                <Link
                  to="/"
                  style={{
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 6, padding: "12px 24px",
                    fontWeight: 600, fontSize: 15, cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  Quay Lại
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "40px 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48 }}>
          <div>
            <h2 style={{ color: S.text, fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
              Nội Dung Phim
            </h2>
            <p style={{ color: S.textSub, lineHeight: 1.8, fontSize: 15 }}>
              {movie.description || "Chưa có mô tả cho phim này."}
            </p>
          </div>

          <div>
            <div style={{
              background: "#f9f9f9", borderRadius: 10,
              border: `1px solid ${S.border}`, padding: 24,
            }}>
              <h3 style={{ color: S.text, margin: "0 0 16px", fontSize: 16, fontWeight: 800 }}>
                Thông Tin Chi Tiết
              </h3>
              {[
                ["Thời lượng", movie.duration ? `${movie.duration} phút` : "N/A"],
                ["Ngày chiếu", movie.release_date || "N/A"],
                ["Trạng thái", statusLabel],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  borderBottom: `1px solid ${S.border}`, paddingBottom: 10, marginBottom: 10,
                }}>
                  <span style={{ color: S.textMuted, fontSize: 13 }}>{k}</span>
                  <span style={{ color: S.text, fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <button
                onClick={() => navigate("/showtimes/select")}
                style={{
                  width: "100%", marginTop: 8,
                  background: S.red, color: "#fff", border: "none",
                  borderRadius: 6, padding: "12px 0",
                  fontWeight: 800, fontSize: 14, cursor: "pointer",
                }}
              >
                ĐẶT VÉ NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
