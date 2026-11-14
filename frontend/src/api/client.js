const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(path, options = {}) {
  const { token, headers: customHeaders, ...fetchOptions } = options

  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.detail || 'Ошибка запроса к API')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
