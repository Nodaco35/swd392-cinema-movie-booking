import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";

const S = {
  red: "#e31f26",
  card: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { movie, showtime } = useBooking();
  const [email, setEmail] = useState("demo.customer@example.com");
  const [password, setPassword] = useState("password123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
      if (showtime) navigate("/seats/select");
      else if (movie) navigate("/showtimes/select");
      else navigate("/");
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Đăng Nhập" hint="Đăng nhập để tiếp tục đặt vé xem phim.">
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{
          background: S.card, borderRadius: 12,
          border: `1px solid ${S.border}`, overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ background: S.red, padding: "20px 28px" }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>
              Đăng Nhập Tài Khoản
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 28 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: S.textMuted, fontSize: 13, marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", borderRadius: 6,
                  border: `1px solid ${S.border}`,
                  padding: "12px 14px",
                  background: "#fff", color: S.text, fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: S.textMuted, fontSize: 13, marginBottom: 6 }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%", borderRadius: 6,
                  border: `1px solid ${S.border}`,
                  padding: "12px 14px",
                  background: "#fff", color: S.text, fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                background: S.red, color: "#fff", border: "none",
                borderRadius: 6, padding: "12px 0",
                fontWeight: 800, fontSize: 15, cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Đang đăng nhập..." : "Đăng Nhập"}
            </button>

            <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: S.textMuted }}>
              Chưa có tài khoản?{" "}
              <Link to="/auth/register" style={{ color: S.red, fontWeight: 600 }}>
                Đăng ký ngay
              </Link>
            </div>

            {isAuthenticated && user && (
              <div style={{ marginTop: 16, textAlign: "center", color: S.textMuted, fontSize: 12 }}>
                Đã đăng nhập: <b>{user.full_name}</b>
              </div>
            )}
          </form>
        </div>
      </div>
    </PageShell>
  );
}
