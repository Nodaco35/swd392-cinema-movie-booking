import { apiClient } from './client'

export async function fetchMovies(params = {}) {
  const response = await apiClient.get('/movies', { params })
  return response.data
}

export async function fetchMovieById(movieId) {
  const response = await apiClient.get(`/movies/${movieId}`)
  return response.data
}

export async function fetchMoviesByIds(movieIds) {
  const ids = Array.from(new Set(movieIds.filter(Boolean)))
  if (!ids.length) return []
  const response = await apiClient.get('/movies', { params: { id: ids } })
  return response.data
}

