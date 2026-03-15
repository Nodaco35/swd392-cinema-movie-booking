import { Link } from "react-router-dom";

const S = {
  red: "#e31f26",
  bg: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#777",
};

export default function NotFoundPage() {
  return (
    <div style={{
      background: S.bg, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 16, color: S.red, fontWeight: 900 }}>404</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: S.text, marginBottom: 8 }}>
          Trang Không Tồn Tại
        </div>
        <div style={{ color: S.textMuted, fontSize: 14, marginBottom: 32 }}>
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </div>
        <Link
          to="/"
          style={{
            background: S.red, color: "#fff",
            border: "none", borderRadius: 6,
            padding: "12px 32px", fontWeight: 800,
            fontSize: 15, cursor: "pointer",
            textDecoration: "none", display: "inline-block",
          }}
        >
          Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
