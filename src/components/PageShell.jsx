const S = {
  bg: "#ffffff",
  headerBg: "#f9f9f9",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
  red: "#e31f26",
};

export function PageShell({ title, hint, children, noPadding }) {
  return (
    <section style={{
      background: S.bg,
      minHeight: "calc(100vh - 200px)",
    }}>
      {!noPadding && (
        <div style={{
          background: S.headerBg,
          padding: "32px 80px 24px",
          borderBottom: `1px solid ${S.border}`,
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <h1 style={{
              color: S.text, fontSize: 26, fontWeight: 900,
              margin: "0 0 8px", letterSpacing: "-0.02em",
            }}>
              {title}
            </h1>
            {hint && (
              <p style={{ color: S.textMuted, fontSize: 14, margin: 0 }}>{hint}</p>
            )}
          </div>
        </div>
      )}
      <div style={{
        padding: noPadding ? 0 : "32px 80px",
        maxWidth: noPadding ? "100%" : 1280,
        margin: "0 auto",
      }}>
        {children}
      </div>
    </section>
  );
}
