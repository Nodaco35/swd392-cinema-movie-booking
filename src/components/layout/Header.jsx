import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkStyle = ({ isActive }) => ({
  padding: "0.4rem 0.65rem",
  borderRadius: 10,
  textDecoration: "none",
  border: "1px solid transparent",
  background: isActive ? "rgba(234,240,255,0.08)" : "transparent",
});

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
          <div style={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Cinema Booking
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
          {user ? (
            <>
              <span
                style={{
                  padding: "0.4rem 0.65rem",
                  borderRadius: 10,
                  color: "rgba(234,240,255,0.9)",
                }}
              >
                {user.name || user.email}
              </span>
              <button className="btn" type="button" onClick={handleLogout}>
                Log Out
              </button>
              <NavLink to="/booking/history" style={linkStyle}>
                History
              </NavLink>
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
