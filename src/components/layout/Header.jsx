import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const S = {
  red: "#e31f26",
  bg: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textSub: "#555",
  textMuted: "#777",
};

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: S.bg,
      borderBottom: `2px solid ${S.red}`,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    }}>
      {/* Top utility bar */}
      <div style={{
        background: S.red,
        display: "flex", justifyContent: "flex-end",
        padding: "4px 24px", gap: 16,
      }}>
        {user ? (
          <>
            <span style={{ color: "#fff", fontSize: 12 }}>
              Xin chào, {user.full_name || user.name || user.email}
            </span>
            <span
              onClick={() => navigate("/booking/history")}
              style={{ color: "#fff", fontSize: 12, cursor: "pointer" }}
            >
              Lịch Sử Đặt Vé
            </span>
            <span
              onClick={handleLogout}
              style={{ color: "#fff", fontSize: 12, cursor: "pointer" }}
            >
              Đăng Xuất
            </span>
          </>
        ) : (
          <>
            <span
              onClick={() => navigate("/auth/login")}
              style={{ color: "#fff", fontSize: 12, cursor: "pointer" }}
            >
              Đăng Nhập
            </span>
            <span
              onClick={() => navigate("/auth/register")}
              style={{ color: "#fff", fontSize: 12, cursor: "pointer" }}
            >
              Đăng Ký
            </span>
          </>
        )}
        <span style={{ color: "#fff", fontSize: 12 }}>Hotline: 1900 6899</span>
      </div>

      {/* Main navigation */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "0 24px", height: 64, gap: 32,
        maxWidth: 1280, margin: "0 auto",
      }}>
        {/* Logo */}
        <NavLink
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, textDecoration: "none" }}
        >
          <div style={{
            background: S.red,
            width: 42, height: 42, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: -1,
          }}>LC</div>
          <div>
            <div style={{ color: S.red, fontWeight: 900, fontSize: 16, letterSpacing: 1 }}>LOTTE</div>
            <div style={{ color: S.text, fontWeight: 600, fontSize: 10, letterSpacing: 2, marginTop: -2 }}>CINEMA</div>
          </div>
        </NavLink>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              background: "none", border: "none",
              color: isActive ? S.red : S.textSub,
              fontWeight: isActive ? 700 : 500,
              fontSize: 13, cursor: "pointer",
              padding: "8px 14px", borderRadius: 5,
              borderBottom: isActive ? `2px solid ${S.red}` : "2px solid transparent",
              textDecoration: "none",
              whiteSpace: "nowrap",
            })}
          >
            Trang Chủ
          </NavLink>

          {user && (
            <NavLink
              to="/booking/history"
              style={({ isActive }) => ({
                background: "none", border: "none",
                color: isActive ? S.red : S.textSub,
                fontWeight: isActive ? 700 : 500,
                fontSize: 13, cursor: "pointer",
                padding: "8px 14px", borderRadius: 5,
                borderBottom: isActive ? `2px solid ${S.red}` : "2px solid transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
              })}
            >
              Lịch Sử
            </NavLink>
          )}
        </div>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "#f5f5f5", border: `1px solid ${S.border}`,
          borderRadius: 20, padding: "6px 16px", gap: 8,
        }}>
          <span style={{ color: S.textMuted, fontSize: 14 }}>🔍</span>
          <input
            placeholder="Tìm phim..."
            type="search"
            style={{
              background: "none", border: "none", color: S.text,
              fontSize: 13, width: 140, outline: "none",
            }}
          />
        </div>

        <button
          onClick={() => navigate("/")}
          style={{
            background: S.red, color: "#fff", border: "none",
            borderRadius: 5, padding: "8px 18px",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Mua Vé
        </button>
      </div>
    </nav>
  );
}
