import { api } from './api'

/**
 * Обратная совместимость для страниц, которые используют apiRequest().
 * Все запросы идут через один axios-инстанс с JWT/refresh-интерсепторами.
 */
export async function apiRequest(path, options = {}) {
  const { token, headers, ...requestOptions } = options

  const response = await api.request({
    url: path,
    ...requestOptions,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return response.data
}

export default apiRequest
