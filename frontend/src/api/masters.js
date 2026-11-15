import { apiRequest } from './client'

export function getMasters(serviceId) {
  const query = serviceId ? `?service=${encodeURIComponent(serviceId)}` : ''

  return apiRequest(`/masters/${query}`)
}