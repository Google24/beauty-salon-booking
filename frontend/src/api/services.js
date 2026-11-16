import { apiRequest } from './client'

export async function getServices(searchQuery = '') {
  const query = searchQuery.trim()
    ? `?search=${encodeURIComponent(searchQuery.trim())}`
    : ''
  const data = await apiRequest(`/catalog/services/${query}`)

  return Array.isArray(data) ? data : data.results || []
}