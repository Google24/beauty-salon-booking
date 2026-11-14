import { apiRequest } from './client'

export function getSlots(masterId, serviceId, date) {
  const params = new URLSearchParams({
    master: masterId,
    service: serviceId,
    date,
  })

  return apiRequest(`/bookings/slots/?${params.toString()}`)
}