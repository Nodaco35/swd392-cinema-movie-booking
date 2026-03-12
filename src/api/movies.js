import { apiClient } from './client'

export async function fetchMovies(params = {}) {
  const response = await apiClient.get('/movies', { params })
  return response.data
}

export async function fetchMovieById(movieId) {
  const response = await apiClient.get(`/movies/${movieId}`)
  return response.data
}

