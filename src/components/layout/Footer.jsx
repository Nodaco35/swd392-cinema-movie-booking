const S = {
  red: "#e31f26",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
};

export function Footer() {
  return (
    <footer style={{
      background: "#f5f5f5",
      borderTop: `1px solid ${S.border}`,
      padding: "40px 80px",
      color: S.textMuted,
      fontSize: 13,
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "flex", gap: 48, flexWrap: "wrap", marginBottom: 24,
      }}>
        <div style={{ minWidth: 200 }}>
          <div style={{ color: S.red, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>
            LOTTE CINEMA
          </div>
          <div>Hệ thống rạp chiếu phim hàng đầu</div>
          <div>Hotline: 1900 6899</div>
          <div>Email: cs@lottecinemavn.com</div>
        </div>
        {[
          ["Về Chúng Tôi", ["Giới Thiệu", "Tuyển Dụng", "Liên Hệ"]],
          ["Hỗ Trợ", ["Hướng Dẫn Mua Vé", "Chính Sách Hoàn Trả", "FAQ"]],
          ["Theo Dõi", ["Facebook", "Instagram", "YouTube"]],
        ].map(([title, items]) => (
          <div key={title} style={{ minWidth: 140 }}>
            <div style={{ color: S.text, fontWeight: 700, marginBottom: 12 }}>{title}</div>
            {items.map(item => (
              <div key={item} style={{ marginBottom: 6, cursor: "pointer" }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        borderTop: `1px solid ${S.border}`,
        paddingTop: 16,
        textAlign: "center",
        maxWidth: 1280,
        margin: "0 auto",
      }}>
        &copy; {new Date().getFullYear()} Lotte Cinema Vietnam. All rights reserved. | Group II - SE1919-NJ
      </div>
    </footer>
  );
}
