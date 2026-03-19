import { useEffect } from "react";

export default function TrailerModal({ trailerUrl, title, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Convert any youtube.com/watch?v=ID or youtu.be/ID to embed URL
  function toEmbedUrl(url) {
    if (!url) return "";
    if (url.includes("/embed/")) return url;
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    return url;
  }

  const embedUrl = toEmbedUrl(trailerUrl);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Modal box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 900,
          background: "#000",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            background: "rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>▶</span>
            <span
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 0.3,
              }}
            >
              {title} — Trailer
            </span>
          </div>
          <button
            onClick={onClose}
            title="Đóng (Esc)"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              width: 32,
              height: 32,
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(227,31,38,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            ✕
          </button>
        </div>

        {/* Video iframe — 16:9 */}
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            src={embedUrl}
            title={`Trailer: ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </div>

        {/* Footer hint */}
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
          }}
        >
          Bấm ra ngoài hoặc nhấn <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 3 }}>Esc</kbd> để đóng
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
