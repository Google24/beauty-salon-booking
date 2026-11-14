import { apiRequest } from './client'

export async function getServices() {
  const data = await apiRequest('/catalog/services/')

  return Array.isArray(data) ? data : data.results || []
}