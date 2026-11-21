import { api } from './api'

/**
 * Обратная совместимость для страниц, которые используют apiRequest().
 * Все запросы идут через один axios-инстанс с JWT/refresh-интерсепторами.
 */
export async function apiRequest(path, options = {}) {
  const { token, headers, body, data, ...requestOptions } = options
  const payload = data !== undefined ? data : body

  const response = await api.request({
    url: path,
    ...requestOptions,
    ...(payload !== undefined ? { data: payload } : {}),
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  return response.data
}

export default apiRequest
