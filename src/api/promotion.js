import { apiClient } from './client'

export async function findPromotionByCode(code) {
  const response = await apiClient.get('/promotion', {
    params: {
      code,
      is_active: true,
    },
  })
  const [promotion] = response.data
  return promotion || null
}

