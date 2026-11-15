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