import { apiClient } from "./client";

export async function fetchCinemas() {
  const response = await apiClient.get("/cinemas");
  return response.data;
}

export async function fetchCinemaById(cinemaId) {
  const response = await apiClient.get(`/cinemas/${cinemaId}`);
  return response.data;
}

export async function fetchCinemasByIds(cinemaIds) {
  const ids = Array.from(new Set(cinemaIds.filter(Boolean)));
  if (!ids.length) return [];
  const response = await apiClient.get("/cinemas", { params: { id: ids } });
  return response.data;
}

// Given showtimes for a movie/date, derive unique cinemas in one call
export async function fetchCinemasForMovieAndDate({ movieId, date }) {
  const showtimesResponse = await apiClient.get("/showtimes", {
    params: {
      movie_id: movieId,
      start_time_like: date,
    },
  });

  const showtimes = showtimesResponse.data;
  const auditoriumIds = Array.from(
    new Set(showtimes.map((s) => s.auditorium_id)),
  );

  if (!auditoriumIds.length) return [];

  // Fetch auditoriums to get cinema_ids
  const auditoriumsResponse = await apiClient.get("/auditorium", {
    params: {
      auditorium_id: auditoriumIds,
    },
  });

  const cinemaIds = Array.from(
    new Set(auditoriumsResponse.data.map((a) => a.cinema_id)),
  );

  const cinemasResponse = await apiClient.get("/cinemas", {
    params: {
      cinema_id: cinemaIds,
    },
  });

  return cinemasResponse.data;
}
