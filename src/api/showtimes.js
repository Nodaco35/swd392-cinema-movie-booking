import { apiClient } from './client'

export async function fetchShowtimesByMovieAndDate({ movieId, date }) {
  // json-server: /showtimes?movie_id=1&start_time_like=2026-03-12
  const params = {
    movie_id: movieId,
    start_time_like: date,
  }
  const response = await apiClient.get('/showtimes', { params })
  return response.data
}

export async function fetchShowtimesByMovie(movieId) {
  const response = await apiClient.get('/showtimes', { params: { movie_id: movieId } })
  return response.data
}

export async function fetchShowtimeById(showtimeId) {
  const response = await apiClient.get(`/showtimes/${showtimeId}`)
  return response.data
}

export async function fetchShowtimesByIds(showtimeIds) {
  const ids = Array.from(new Set(showtimeIds.filter(Boolean)))
  if (!ids.length) return []
  const response = await apiClient.get('/showtimes', { params: { showtime_id: ids } })
  return response.data
}

