import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MovieCard } from "../components/MovieCard";
import { fetchMovies } from "../api/movies";

const S = {
  red: "#e31f26",
  bg: "#ffffff",
  sectionBg: "#f9f9f9",
  card: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textSub: "#555",
  textMuted: "#777",
  gold: "#f5c518",
};

export default function HomePage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchMovies();
        if (isMounted) setMovies(data);
      } catch (err) {
        if (isMounted) setError("Không thể tải danh sách phim.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const featured = movies.slice(0, 3);
  const nowShowing = movies.filter(m => m.status !== "upcoming" && m.status !== "ended");
  const comingSoon = movies.filter(m => m.status === "upcoming");

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setSlide(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (loading) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: S.textMuted, fontSize: 16 }}>Đang tải phim...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#dc2626", fontSize: 16 }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ background: S.bg, minHeight: "100vh" }}>
      {/* Hero Slider */}
      {featured.length > 0 && (
        <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
          <div style={{
            width: "100%", height: "100%",
            backgroundImage: featured[slide]?.poster
              ? `url(${featured[slide].poster})`
              : "linear-gradient(135deg, #e31f26, #8b0000)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "all 0.5s",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center",
            padding: "0 80px",
          }}>
            <div style={{ maxWidth: 550 }}>
              <div style={{
                fontSize: 36, fontWeight: 900, color: "#fff",
                lineHeight: 1.2, marginBottom: 8,
              }}>
                {featured[slide]?.title}
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                {featured[slide]?.description
                  ? featured[slide].description.substring(0, 150) + "..."
                  : ""}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => navigate(`/movies/${featured[slide]?.movie_id}`)}
                  style={{
                    background: S.red, color: "#fff", border: "none",
                    borderRadius: 6, padding: "12px 28px",
                    fontWeight: 800, fontSize: 15, cursor: "pointer",
                  }}
                >
                  MUA VÉ NGAY
                </button>
                <button
                  onClick={() => navigate(`/movies/${featured[slide]?.movie_id}`)}
                  style={{
                    background: "rgba(255,255,255,0.15)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: 6, padding: "12px 28px",
                    fontWeight: 700, fontSize: 15, cursor: "pointer",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Chi Tiết
                </button>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 8,
          }}>
            {featured.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{
                width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
                background: i === slide ? S.red : "rgba(255,255,255,0.5)",
                cursor: "pointer", transition: "all 0.3s",
              }} />
            ))}
          </div>

          {/* Arrows */}
          {featured.length > 1 && (
            <>
              <button
                onClick={() => setSlide((slide - 1 + featured.length) % featured.length)}
                style={{
                  position: "absolute", top: "50%", transform: "translateY(-50%)",
                  left: 20,
                  background: "rgba(0,0,0,0.4)", color: "#fff", border: "none",
                  width: 44, height: 44, borderRadius: "50%",
                  fontSize: 24, cursor: "pointer", fontWeight: 900,
                }}
              >&#8249;</button>
              <button
                onClick={() => setSlide((slide + 1) % featured.length)}
                style={{
                  position: "absolute", top: "50%", transform: "translateY(-50%)",
                  right: 20,
                  background: "rgba(0,0,0,0.4)", color: "#fff", border: "none",
                  width: 44, height: 44, borderRadius: "50%",
                  fontSize: 24, cursor: "pointer", fontWeight: 900,
                }}
              >&#8250;</button>
            </>
          )}
        </div>
      )}

      {/* Quick Booking Bar */}
      <div style={{
        background: S.red,
        padding: "16px 80px",
        display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
      }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginRight: 8 }}>
          ĐẶT VÉ NHANH
        </span>
        {["Chọn rạp", "Chọn phim", "Chọn ngày"].map(t => (
          <select key={t} style={{
            background: "rgba(255,255,255,0.2)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: 5, padding: "8px 16px",
            fontSize: 13, cursor: "pointer",
          }}>
            <option>{t}</option>
          </select>
        ))}
        <button style={{
          background: "#fff", color: S.red,
          border: "none", borderRadius: 5,
          padding: "9px 24px", fontWeight: 800, fontSize: 13, cursor: "pointer",
        }}>TÌM SUẤT CHIẾU</button>
      </div>

      {/* Now Showing */}
      <div style={{ padding: "48px 80px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 28, background: S.red, borderRadius: 2 }} />
            <span style={{ color: S.text, fontSize: 22, fontWeight: 800 }}>Phim Đang Chiếu</span>
          </div>
        </div>

        {nowShowing.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}>
            {nowShowing.map(m => (
              <MovieCard key={m.movie_id} movie={m} />
            ))}
          </div>
        ) : (
          <div style={{ color: S.textMuted, textAlign: "center", padding: "40px 0" }}>
            Không có phim đang chiếu
          </div>
        )}
      </div>

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <div style={{ padding: "0 80px 48px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ width: 4, height: 28, background: "#f59e0b", borderRadius: 2 }} />
            <span style={{ color: S.text, fontSize: 22, fontWeight: 800 }}>Phim Sắp Chiếu</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}>
            {comingSoon.map(m => (
              <MovieCard key={m.movie_id} movie={m} />
            ))}
          </div>
        </div>
      )}

      {/* Promo Banner */}
      <div style={{
        margin: "0 80px 48px",
        maxWidth: 1280,
        marginLeft: "auto", marginRight: "auto",
        padding: "0 80px",
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${S.red} 0%, #8b0000 100%)`,
          borderRadius: 12, padding: "32px 48px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>
              Mua 1 Tặng 1
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 6 }}>
              Vé xem phim chỉ từ 45.000đ mỗi thứ 4 hàng tuần. Áp dụng cho thành viên.
            </div>
          </div>
          <button style={{
            background: "#fff", color: S.red,
            border: "none", borderRadius: 6,
            padding: "12px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer",
          }}>Khám Phá Ngay</button>
        </div>
      </div>
    </div>
  );
}
