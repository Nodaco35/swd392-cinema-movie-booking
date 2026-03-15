import { useEffect, useState } from "react";
import { PageShell } from "../components/PageShell";
import { MovieCard } from "../components/MovieCard";
import { fetchMovies } from "../api/movies";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchMovies();
        if (isMounted) {
          setMovies(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load movies right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageShell
      title="Movie List"
      hint="Browse movies currently available to book."
    >
      {loading && (
        <div style={{ color: "var(--muted)", fontSize: 14 }}>
          Loading movies...
        </div>
      )}
      {error && (
        <div
          style={{ color: "#ffb3b3", fontSize: 14, marginBottom: "0.75rem" }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            marginTop: "0.75rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.9rem",
          }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
