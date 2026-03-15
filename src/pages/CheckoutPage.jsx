import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { findPromotionByCode } from "../api/promotion";
import { releaseHolds } from "../api/seatHolds";

const S = {
  red: "#e31f26",
  card: "#ffffff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  textMuted: "#777",
  textSub: "#555",
  orange: "#f59e0b",
};

function HoldCountdown({ holdUntil }) {
  const [msLeft, setMsLeft] = useState(() =>
    holdUntil ? Math.max(0, new Date(holdUntil) - Date.now()) : 0,
  );

  useEffect(() => {
    if (!holdUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, new Date(holdUntil) - Date.now());
      setMsLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [holdUntil]);

  if (!holdUntil || msLeft === 0) return null;

  const totalSecs = Math.ceil(msLeft / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = (totalSecs % 60).toString().padStart(2, "0");
  const isUrgent = totalSecs <= 120; // last 2 minutes

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        borderRadius: 8,
        marginBottom: 20,
        background: isUrgent
          ? "rgba(239,68,68,0.08)"
          : "rgba(245,158,11,0.08)",
        border: `1px solid ${isUrgent ? "#ef4444" : S.orange}`,
      }}
    >
      <span style={{ fontSize: 16 }}>{isUrgent ? "⚠️" : "⏱"}</span>
      <span
        style={{
          fontSize: 13,
          color: isUrgent ? "#ef4444" : S.orange,
          fontWeight: 600,
        }}
      >
        Ghế được giữ trong{" "}
        <b>
          {m}:{s}
        </b>{" "}
        nữa. Hoàn tất thanh toán trước khi hết giờ!
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    movie,
    date,
    cinema,
    showtime,
    selectedSeatIds,
    promotion,
    setPromotion,
    subtotal,
    discount,
    total,
  } = useBooking();

  const holdUntil = location.state?.holdUntil ?? null;
  const userId = user?.user_id ?? user?.id;

  const [promoInput, setPromoInput] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const handleApplyPromotion = async (event) => {
    event.preventDefault();
    if (!promoInput.trim()) {
      setPromoStatus("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    setApplyingPromo(true);
    setPromoStatus("");
    try {
      const promo = await findPromotionByCode(promoInput.trim());
      if (!promo) {
        setPromoStatus("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");
        setPromotion(null);
        return;
      }
      setPromotion(promo);
      setPromoStatus(`Đã áp dụng mã "${promo.code}".`);
    } catch {
      setPromoStatus("Không thể kiểm tra mã khuyến mãi.");
    } finally {
      setApplyingPromo(false);
    }
  };

  // Release holds and go back to seat selection
  const handleBackToSeats = async () => {
    try {
      if (showtime && userId) {
        await releaseHolds({ userId, showtimeId: showtime.showtime_id });
      }
    } catch {
      // best effort
    }
    navigate("/seats/select");
  };

  return (
    <PageShell
      title="Thanh Toán"
      hint="Kiểm tra đơn hàng, áp dụng khuyến mãi và chọn phương thức thanh toán."
    >
      {!movie || !showtime || !cinema || !selectedSeatIds.length ? (
        <div style={{ color: "#dc2626", fontSize: 14 }}>
          Đơn hàng chưa hoàn tất. Vui lòng chọn phim, suất chiếu và ghế trước.
        </div>
      ) : (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Hold countdown */}
          <HoldCountdown holdUntil={holdUntil} />

          <div
            style={{
              background: S.card,
              borderRadius: 12,
              border: `1px solid ${S.border}`,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {/* Header */}
            <div style={{ background: S.red, padding: "20px 28px" }}>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>
                Xác Nhận Đặt Vé
              </div>
            </div>

            <div style={{ padding: 28 }}>
              {/* Movie info */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 24,
                  paddingBottom: 24,
                  borderBottom: `1px solid ${S.border}`,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 110,
                    borderRadius: 6,
                    flexShrink: 0,
                    backgroundImage: movie.poster
                      ? `url(${movie.poster})`
                      : `linear-gradient(135deg, ${S.red}, #8b0000)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div>
                  <div
                    style={{ color: S.text, fontWeight: 800, fontSize: 16 }}
                  >
                    {movie.title}
                  </div>
                  <div
                    style={{ color: S.textMuted, fontSize: 13, marginTop: 4 }}
                  >
                    {movie.duration ? `${movie.duration} phút` : ""}
                  </div>
                </div>
              </div>

              {/* Booking details */}
              {[
                ["Rạp", cinema.name],
                ["Ngày", date],
                [
                  "Suất",
                  new Date(showtime.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                ],
                ["Số ghế", `${selectedSeatIds.length} ghế`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: `1px solid ${S.border}`,
                  }}
                >
                  <span style={{ color: S.textMuted, fontSize: 14 }}>{k}</span>
                  <span style={{ color: S.text, fontWeight: 600, fontSize: 14 }}>
                    {v}
                  </span>
                </div>
              ))}

              {/* Promotion */}
              <div style={{ marginTop: 20 }}>
                <div
                  style={{ color: S.textMuted, fontSize: 13, marginBottom: 8 }}
                >
                  Mã khuyến mãi
                </div>
                <form
                  onSubmit={handleApplyPromotion}
                  style={{ display: "flex", gap: 8 }}
                >
                  <input
                    type="text"
                    placeholder="Nhập mã..."
                    value={promoInput}
                    onChange={(e) =>
                      setPromoInput(e.target.value.toUpperCase())
                    }
                    style={{
                      flex: 1,
                      background: "#fff",
                      border: `1px solid ${S.border}`,
                      borderRadius: 6,
                      padding: "10px 14px",
                      color: S.text,
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={applyingPromo}
                    style={{
                      background: "#f5f5f5",
                      color: S.text,
                      border: `1px solid ${S.border}`,
                      borderRadius: 6,
                      padding: "10px 18px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {applyingPromo ? "..." : "Áp Dụng"}
                  </button>
                </form>
                {promoStatus && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: promoStatus.includes("Đã áp dụng")
                        ? S.textMuted
                        : "#dc2626",
                    }}
                  >
                    {promoStatus}
                  </div>
                )}
                {promotion && (
                  <div
                    style={{ marginTop: 4, fontSize: 12, color: S.textMuted }}
                  >
                    Khuyến mãi:{" "}
                    <b>
                      {promotion.code} ({Number(promotion.discount_percent || 0)}
                      %)
                    </b>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div
                style={{
                  marginTop: 20,
                  borderTop: `1px solid ${S.border}`,
                  paddingTop: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: S.textMuted, fontSize: 14 }}>
                    Tạm tính
                  </span>
                  <span style={{ color: S.text, fontSize: 14 }}>
                    {subtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: S.textMuted, fontSize: 14 }}>
                    Giảm giá
                  </span>
                  <span style={{ color: "#22c55e", fontSize: 14 }}>
                    - {discount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    marginTop: 8,
                  }}
                >
                  <span
                    style={{
                      color: S.text,
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    Tổng Cộng
                  </span>
                  <span
                    style={{
                      color: S.red,
                      fontWeight: 900,
                      fontSize: 22,
                    }}
                  >
                    {total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Payment method */}
              <div style={{ marginTop: 16 }}>
                <div
                  style={{ color: S.textMuted, fontSize: 13, marginBottom: 8 }}
                >
                  Phương thức thanh toán
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    ["card", "Thẻ"],
                    ["momo", "Momo"],
                    ["cash", "Tiền mặt"],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPaymentMethod(val)}
                      style={{
                        background:
                          paymentMethod === val
                            ? "rgba(227,31,38,0.08)"
                            : "#fff",
                        color: paymentMethod === val ? S.red : S.text,
                        border: `1px solid ${paymentMethod === val ? S.red : S.border}`,
                        borderRadius: 6,
                        padding: "8px 20px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={() =>
                  navigate("/payment", {
                    state: { paymentMethod, holdUntil },
                  })
                }
                style={{
                  width: "100%",
                  marginTop: 24,
                  background: S.red,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px 0",
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: "pointer",
                  letterSpacing: 1,
                }}
              >
                THANH TOÁN NGAY
              </button>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {["VNPay", "Momo", "ZaloPay", "Visa"].map((p) => (
                  <span
                    key={p}
                    style={{
                      background: "#f5f5f5",
                      border: `1px solid ${S.border}`,
                      borderRadius: 4,
                      padding: "4px 10px",
                      color: S.textMuted,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Back link — releases hold */}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button
                  type="button"
                  onClick={handleBackToSeats}
                  style={{
                    background: "none",
                    border: "none",
                    color: S.textMuted,
                    fontSize: 13,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  ← Quay lại chọn ghế
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
