import { apiRequest } from './client'

export function getUsers(search = '', token) {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''

  return apiRequest(`/auth/users/${query}`, { token })
}

export function updateUserRole(id, role, token) {
  return apiRequest(`/auth/users/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ role }),
  })
}

export function getAdminCategories(token) {
  return apiRequest('/catalog/categories/', { token })
}

export function getAdminServices(token) {
  return apiRequest('/catalog/services/', { token })
}

export function createService(data, token) {
  return apiRequest('/catalog/services/', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}

export function updateService(id, data, token) {
  return apiRequest(`/catalog/services/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  })
}

export function deleteService(id, token) {
  return apiRequest(`/catalog/services/${id}/`, {
    method: 'DELETE',
    token,
  })
}
