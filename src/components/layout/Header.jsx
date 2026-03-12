import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkStyle = ({ isActive }) => ({
  padding: "0.4rem 0.65rem",
  borderRadius: 10,
  textDecoration: "none",
  border: "1px solid transparent",
  background: isActive ? "rgba(234,240,255,0.08)" : "transparent",
});

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={{ borderBottom: "1px solid rgba(234,240,255,0.12)" }}>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 0",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, rgba(106,163,255,0.9), rgba(124,92,255,0.9))",
            }}
          />
          <div>
            <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Cinema Booking
            </div>
          </div>
        </div>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            flexWrap: "wrap",
          }}
        >
          <NavLink to="/" style={linkStyle} end>
            Home
          </NavLink>
          {user && (
            <NavLink to="/booking/history" style={linkStyle}>
              History
            </NavLink>
          )}
          {user ? (
            <>
              <span
                style={{ ...linkStyle({ isActive: false }), cursor: "default" }}
              >
                {user.name}
              </span>
              <button
                onClick={logout}
                style={{
                  ...linkStyle({ isActive: false }),
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.4rem 0.65rem",
                  fontSize: 15,
                  color: "rgba(234,240,255,0.72)",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/auth/login" style={linkStyle}>
                Login
              </NavLink>
              <NavLink to="/auth/register" style={linkStyle}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
