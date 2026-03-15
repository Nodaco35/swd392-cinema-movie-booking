import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { useBooking } from "../context/BookingContext";
import {
  fetchBookedSeatIdsForShowtime,
  fetchSeatsByAuditorium,
} from "../api/seats";

export default function SeatSelectionPage() {
  const navigate = useNavigate();
  const { showtime, cinema, selectedSeatIds, setSelectedSeatIds } =
    useBooking();
  const [seats, setSeats] = useState([]);
  const [bookedSeatIds, setBookedSeatIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!showtime) return;
      setLoading(true);
      setError("");
      try {
        const [allSeats, booked] = await Promise.all([
          fetchSeatsByAuditorium(showtime.auditorium_id),
          fetchBookedSeatIdsForShowtime(showtime.showtime_id),
        ]);
        setSeats(allSeats);
        setBookedSeatIds(booked);
      } catch (err) {
        setError("Unable to load seats for this showtime.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showtime]);

  const seatsByRow = useMemo(() => {
    const grouped = new Map();
    for (const seat of seats) {
      if (!grouped.has(seat.row_name)) {
        grouped.set(seat.row_name, []);
      }
      grouped.get(seat.row_name).push(seat);
    }
    for (const row of grouped.values()) {
      row.sort((a, b) => a.seat_number - b.seat_number);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const handleToggleSeat = (seat) => {
    const id = seat.seat_id;
    const isBooked = bookedSeatIds.includes(id);
    if (isBooked) return;

    const isSelected = selectedSeatIds.includes(id);
    if (isSelected) {
      setSelectedSeatIds(selectedSeatIds.filter((s) => s !== id));
    } else {
      if (selectedSeatIds.length >= 8) {
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, id]);
    }
  };

  return (
    <PageShell
      title="Seat Selection"
      hint={
        showtime
          ? `Choose up to 8 seats for this showtime at ${cinema?.name ?? "the selected cinema"}.`
          : "Please select a movie, date, and showtime first."
      }
    >
      {!showtime && (
        <div style={{ color: "#ffb3b3", fontSize: 14 }}>
          No showtime selected. Go back to showtime selection first.
        </div>
      )}

      {showtime && (
        <>
          {error && (
            <div
              style={{ color: "#ffb3b3", fontSize: 13, marginBottom: "0.5rem" }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
            Screen
            <div
              style={{
                marginTop: 4,
                marginBottom: 8,
                height: 4,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(106,163,255,0.4), rgba(124,92,255,0.4))",
              }}
            />
          </div>

          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: "0.4rem",
              padding: "0.6rem 0.8rem",
              borderRadius: 16,
              border: "1px solid var(--border)",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            {seatsByRow.map(([rowLabel, rowSeats]) => (
              <div
                key={rowLabel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span
                  style={{
                    width: 16,
                    fontSize: 12,
                    textAlign: "right",
                    color: "var(--muted)",
                  }}
                >
                  {rowLabel}
                </span>
                {rowSeats.map((seat) => {
                  const isBooked = bookedSeatIds.includes(seat.seat_id);
                  const isSelected = selectedSeatIds.includes(seat.seat_id);
                  const baseStyle = {
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    fontSize: 11,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isBooked ? "not-allowed" : "pointer",
                    background: "rgba(15,23,42,0.7)",
                    color: "var(--text)",
                  };

                  let style = baseStyle;
                  if (isBooked) {
                    style = {
                      ...baseStyle,
                      background: "rgba(148,163,184,0.35)",
                      borderColor: "rgba(148,163,184,0.6)",
                      color: "rgba(226,232,240,0.5)",
                    };
                  } else if (isSelected) {
                    style = {
                      ...baseStyle,
                      background:
                        "linear-gradient(135deg, rgba(106,163,255,0.9), rgba(124,92,255,0.9))",
                      borderColor: "rgba(248,250,252,0.9)",
                    };
                  }

                  return (
                    <button
                      key={seat.seat_id}
                      type="button"
                      onClick={() => handleToggleSeat(seat)}
                      disabled={isBooked}
                      style={style}
                      aria-label={`${rowLabel}${seat.seat_number} ${
                        isBooked
                          ? "booked"
                          : isSelected
                            ? "selected"
                            : "available"
                      }`}
                    >
                      {seat.seat_number}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            <span>
              Selected seats:{" "}
              <b>{selectedSeatIds.length ? selectedSeatIds.length : 0}</b> / 8
            </span>
          </div>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <Link className="btn" to="/showtimes/select">
              Back to Showtimes
            </Link>
            <button
              className="btn"
              type="button"
              disabled={!selectedSeatIds.length}
              onClick={() => navigate("/checkout")}
            >
              Continue to Checkout
            </button>
          </div>
        </>
      )}
    </PageShell>
  );
}
