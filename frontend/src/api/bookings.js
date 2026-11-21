import { apiRequest } from './client'

export function getSlots(masterId, serviceId, date) {
  const params = new URLSearchParams({
    master: masterId,
    service: serviceId,
    date,
  })

  return apiRequest(`/bookings/slots/?${params.toString()}`)
}

export function createBooking(data, token) {
  return apiRequest('/bookings/bookings/', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}

export function getMyBookings(token) {
  return apiRequest('/bookings/bookings/', { token })
}

export function getMasterBookings(token) {
  return apiRequest('/bookings/bookings/', { token })
}

export function createReview(bookingId, data, token) {
  return apiRequest(`/bookings/bookings/${bookingId}/review/`, {
    method: 'POST',
    token,
    body: JSON.stringify({ rating: data.rating, text: data.text }),
  })
}

export function cancelBooking(id, token) {
  return apiRequest(`/bookings/bookings/${id}/cancel/`, {
    method: 'POST',
    token,
  })
}

export function getPublicReviews(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return
    search.set(key, String(value))
  })

  const query = search.toString()

  return apiRequest(`/bookings/public-reviews/${query ? `?${query}` : ''}`)
}