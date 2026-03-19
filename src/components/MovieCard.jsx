import { useState } from "react";
import { Link } from "react-router-dom";
import TrailerModal from "./TrailerModal";

const S = {
  red: "#e31f26",
  card: "#ffffff",
  cardHover: "#fafafa",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
  gold: "#f5c518",
};

function formatDuration(minutes) {
  if (!minutes) return "";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hrs) return `${mins} phút`;
  if (!mins) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function deriveStatus(status) {
  if (status === "upcoming") return "Sắp Chiếu";
  if (status === "ended") return "Đã Kết Thúc";
  return "Đang Chiếu";
}

function RatingBadge({ rating }) {
  const colors = { P: "#22c55e", T13: "#f59e0b", T18: "#ef4444", C18: "#7c3aed" };
  return (
    <span style={{
      background: colors[rating] || S.red,
      color: "#fff",
      fontSize: 10,
      fontWeight: 800,
      padding: "2px 6px",
      borderRadius: 3,
      letterSpacing: 0.5,
    }}>{rating || "P"}</span>
  );
}

export function MovieCard({ movie }) {
  const [hovered, setHovered] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const status = deriveStatus(movie.status);
  const duration = formatDuration(movie.duration);
  const posterUrl = movie.poster;

  return (
    <>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: "pointer",
          background: hovered ? S.cardHover : S.card,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${hovered ? S.red : S.border}`,
          transition: "all 0.2s",
          transform: hovered ? "translateY(-4px)" : "none",
          boxShadow: hovered ? "0 12px 30px rgba(227,31,38,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link
          to={`/movies/${movie.movie_id}`}
          style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", flexDirection: "column" }}
        >
          <div style={{ position: "relative" }}>
            <div style={{
              width: "100%",
              height: 280,
              backgroundImage: posterUrl
                ? `url(${posterUrl})`
                : "linear-gradient(135deg, #e31f26, #8b0000)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
            <div style={{
              position: "absolute", top: 8, left: 8,
              display: "flex", gap: 4,
            }}>
              <RatingBadge rating={movie.rating} />
            </div>
            {movie.status === "upcoming" && (
              <div style={{
                position: "absolute", top: 8, right: 8,
                background: "#f59e0b", color: "#000",
                fontSize: 10, fontWeight: 800,
                padding: "2px 7px", borderRadius: 3,
              }}>SẮP CHIẾU</div>
            )}
            {/* Play trailer overlay on hover */}
            {hovered && movie.trailer && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
              }}>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTrailer(true); }}
                  style={{
                    background: "rgba(227,31,38,0.88)",
                    border: "none", borderRadius: "50%",
                    width: 52, height: 52,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: 20, color: "#fff",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                    transition: "transform 0.15s",
                  }}
                  title="Xem Trailer"
                >
                  ▶
                </button>
              </div>
            )}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
              padding: "30px 12px 10px",
            }} />
          </div>

          <div style={{ padding: "12px 12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              fontWeight: 700, fontSize: 14, color: S.text,
              marginBottom: 4, lineHeight: 1.3,
            }}>
              {movie.title}
            </div>
            <div style={{
              fontSize: 12, color: S.textMuted, marginBottom: 8,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              lineHeight: 1.3, maxHeight: "2.6em",
            }}>
              {movie.description || movie.genre || ""}
            </div>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                padding: "2px 8px", borderRadius: 999,
                border: `1px solid ${S.border}`,
                fontSize: 11, color: S.textMuted,
                background: "#f9f9f9",
              }}>
                {status}
              </span>
              {duration && (
                <span style={{ color: S.textMuted, fontSize: 11 }}>{duration}</span>
              )}
            </div>
            {hovered && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {movie.trailer && (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTrailer(true); }}
                    style={{
                      width: "100%",
                      background: "rgba(227,31,38,0.1)", color: S.red,
                      border: `1.5px solid ${S.red}`, borderRadius: 5,
                      padding: "7px 0", fontWeight: 700,
                      fontSize: 12, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    }}
                  >
                    ▶ Xem Trailer
                  </button>
                )}
                <button style={{
                  width: "100%",
                  background: S.red, color: "#fff",
                  border: "none", borderRadius: 5,
                  padding: "8px 0", fontWeight: 700,
                  fontSize: 13, cursor: "pointer",
                }}>
                  MUA VÉ NGAY
                </button>
              </div>
            )}
          </div>
        </Link>
      </article>

      {showTrailer && movie.trailer && (
        <TrailerModal
          trailerUrl={movie.trailer}
          title={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </>
  );
}
