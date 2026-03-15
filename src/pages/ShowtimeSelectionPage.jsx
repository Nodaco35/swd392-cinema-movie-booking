import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/PageShell";
import { fetchShowtimesByMovieAndDate } from "../api/showtimes";
import { fetchCinemasForMovieAndDate } from "../api/cinemas";
import { useBooking } from "../context/BookingContext";

export default function ShowtimeSelectionPage() {
  const navigate = useNavigate();
  const { movie, date, cinema, showtime, setDate, setCinema, setShowtime } =
    useBooking();
  const [availableDates, setAvailableDates] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Derive the set of dates for the selected movie from all its showtimes.
  useEffect(() => {
    async function loadDates() {
      if (!movie) return;
      setLoading(true);
      setError("");
      try {
        // Fetch all showtimes for this movie, then extract unique dates.
        const allForMovie = await fetchShowtimesByMovieAndDate({
          movieId: movie.movie_id,
          date: "", // empty like = all for movie
        });
        const dates = Array.from(
          new Set(allForMovie.map((s) => s.start_time.slice(0, 10))),
        ).sort((a, b) => a.localeCompare(b));
        setAvailableDates(dates);
        if (!date && dates.length) {
          setDate(dates[0]);
        }
      } catch (err) {
        setError("Unable to load showtimes for this movie.");
      } finally {
        setLoading(false);
      }
    }
    loadDates();
  }, [movie, date, setDate]);

  // When date changes, load cinemas that have showtimes for this movie/date.
  useEffect(() => {
    async function loadCinemas() {
      if (!movie || !date) return;
      setLoading(true);
      setError("");
      try {
        const result = await fetchCinemasForMovieAndDate({
          movieId: movie.movie_id,
          date,
        });
        setCinemas(result);
        if (!cinema && result.length) {
          setCinema(result[0]);
        }
      } catch (err) {
        setError("Unable to load cinemas for this date.");
      } finally {
        setLoading(false);
      }
    }
    loadCinemas();
  }, [movie, date, cinema, setCinema]);

  // When date or cinema changes, load the concrete showtimes for that combination.
  useEffect(() => {
    async function loadShowtimes() {
      if (!movie || !date || !cinema) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchShowtimesByMovieAndDate({
          movieId: movie.movie_id,
          date,
        });
        const filtered = data.filter(
          (s) => Number(s.Auditorium.cinema_id) === Number(cinema.cinema_id),
        );
        setShowtimes(filtered);
      } catch (err) {
        setError("Unable to load showtimes for this cinema.");
      } finally {
        setLoading(false);
      }
    }
    loadShowtimes();
  }, [movie, date, cinema]);

  const movieTitle = movie?.title || "Select Showtime";

  const formattedShowtimes = useMemo(
    () =>
      showtimes.map((s) => {
        const start = new Date(s.start_time);
        return {
          ...s,
          startLabel: start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }),
    [showtimes],
  );

  return (
    <PageShell
      title="Showtime Selection"
      hint={
        movie
          ? `Choose a date, cinema, and showtime for "${movieTitle}".`
          : "First choose a movie, then select a date, cinema, and showtime."
      }
    >
      {!movie && (
        <div style={{ color: "#ffb3b3", fontSize: 14 }}>
          No movie selected. Please go back to the movie list and pick a movie
          first.
        </div>
      )}

      {movie && (
        <>
          {error && (
            <div
              style={{
                color: "#ffb3b3",
                fontSize: 14,
                marginBottom: "0.75rem",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            {/* Step 1: Date */}
            <section className="card">
              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Step 1 · Date
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {availableDates.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className="btn"
                    onClick={() => {
                      setDate(d);
                      setCinema(null);
                      setShowtime(null);
                    }}
                    style={
                      d === date
                        ? {
                            borderColor: "rgba(234,240,255,0.5)",
                            background: "rgba(255,255,255,0.08)",
                          }
                        : undefined
                    }
                  >
                    {d}
                  </button>
                ))}
                {!availableDates.length && (
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    No showtimes found for this movie.
                  </span>
                )}
              </div>
            </section>

            {/* Step 2: Cinema */}
            <section className="card">
              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Step 2 · Cinema
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {cinemas.map((c) => (
                  <button
                    key={c.cinema_id}
                    type="button"
                    className="btn"
                    onClick={() => {
                      setCinema(c);
                      setShowtime(null);
                    }}
                    style={
                      cinema && c.cinema_id === cinema.cinema_id
                        ? {
                            borderColor: "rgba(234,240,255,0.5)",
                            background: "rgba(255,255,255,0.08)",
                          }
                        : undefined
                    }
                  >
                    {c.name}
                  </button>
                ))}
                {date && !cinemas.length && (
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    No cinemas available for this date.
                  </span>
                )}
              </div>
            </section>

            {/* Step 3: Showtime */}
            <section className="card">
              <div
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: "0.4rem",
                }}
              >
                Step 3 · Showtime
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {formattedShowtimes.map((s) => (
                  <button
                    key={s.showtime_id}
                    type="button"
                    className="btn"
                    onClick={() => setShowtime(s)}
                    style={
                      showtime && s.showtime_id === showtime.showtime_id
                        ? {
                            borderColor: "rgba(234,240,255,0.5)",
                            background: "rgba(255,255,255,0.08)",
                          }
                        : undefined
                    }
                  >
                    {s.startLabel}
                  </button>
                ))}
                {cinema && !formattedShowtimes.length && (
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    No showtimes for this cinema on the selected date.
                  </span>
                )}
              </div>
            </section>
          </div>

          {loading && (
            <div
              style={{
                color: "var(--muted)",
                fontSize: 13,
                marginTop: "0.5rem",
              }}
            >
              Loading options...
            </div>
          )}

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link className="btn" to={`/movies/${movie?.movie_id ?? ""}`}>
              Back to Movie
            </Link>
            <button
              className="btn"
              type="button"
              disabled={!showtime}
              onClick={() => navigate("/seats/select")}
            >
              Continue to Seat Selection
            </button>
          </div>
        </>
      )}
    </PageShell>
  );
}
