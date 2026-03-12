import { apiClient } from './client'

export async function fetchCinemas() {
  const response = await apiClient.get('/cinemas')
  return response.data
}

export async function fetchCinemaById(cinemaId) {
  const response = await apiClient.get(`/cinemas/${cinemaId}`)
  return response.data
}

// Given showtimes for a movie/date, derive unique cinemas in one call
export async function fetchCinemasForMovieAndDate({ movieId, date }) {
  const showtimesResponse = await apiClient.get('/showtimes', {
    params: {
      movie_id: movieId,
      start_time_like: date,
    },
  })

  const showtimes = showtimesResponse.data
  const cinemaIds = Array.from(new Set(showtimes.map((s) => s.cinema_id)))

  if (!cinemaIds.length) return []

  const cinemasResponse = await apiClient.get('/cinemas', {
    params: {
      id: cinemaIds,
    },
  })

  return cinemasResponse.data
}

