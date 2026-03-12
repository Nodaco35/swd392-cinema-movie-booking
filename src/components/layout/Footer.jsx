export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(234,240,255,0.12)",
        marginTop: "2rem",
      }}
    >
      <div
        className="container"
        style={{
          padding: "1.25rem 0",
          color: "rgba(234,240,255,0.72)",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <span>© {new Date().getFullYear()} Cinema Booking </span>
        <span style={{ fontSize: 12 }}>Group II - SE1919-NJ</span>
      </div>
    </footer>
  );
}
