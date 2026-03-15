import { apiClient } from './client'

// json-server doesn't do real auth; these are simple lookups/creates.

export async function login({ email, password }) {
  const response = await apiClient.get('/users', {
    params: { email, password },
  })
  const [user] = response.data
  if (!user) {
    throw new Error('Invalid credentials')
  }
  return user
}

export async function register({ name, email, password }) {
  const response = await apiClient.post('/users', {
    full_name: name,
    email,
    password,
    role: 'customer',
  })
  return response.data
}

export async function fetchUserById(userId) {
  const response = await apiClient.get(`/users/${userId}`)
  return response.data
}

