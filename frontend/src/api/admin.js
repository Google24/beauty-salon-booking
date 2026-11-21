import { api } from './api'

function toQuery(params = {}) {
  if (typeof params === 'string') {
    return params.trim() ? `?search=${encodeURIComponent(params.trim())}` : ''
  }

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) return
    searchParams.set(key, String(value))
  })

  const query = searchParams.toString()

  return query ? `?${query}` : ''
}

export function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results

  return []
}

/* ------------------------------- Пользователи ------------------------------ */

export function getUsers(params = {}) {
  return api.get(`/auth/users/${toQuery(params)}`).then((response) => response.data)
}

export function updateUser(id, data) {
  return api.patch(`/auth/users/${id}/`, data).then((response) => response.data)
}

/* ------------------------------- Категории -------------------------------- */

export function getCategories(params = {}) {
  return api.get(`/catalog/categories/${toQuery(params)}`).then((response) => response.data)
}

export function createCategory(data) {
  return api.post('/catalog/categories/', data).then((response) => response.data)
}

export function updateCategory(id, data) {
  return api.patch(`/catalog/categories/${id}/`, data).then((response) => response.data)
}

export function deleteCategory(id) {
  return api.delete(`/catalog/categories/${id}/`).then((response) => response.data)
}

/* --------------------------------- Услуги --------------------------------- */

export function getServices(params = {}) {
  return api.get(`/catalog/services/${toQuery(params)}`).then((response) => response.data)
}

export function createService(data) {
  return api.post('/catalog/services/', data).then((response) => response.data)
}

export function updateService(id, data) {
  return api.patch(`/catalog/services/${id}/`, data).then((response) => response.data)
}

export function deleteService(id) {
  return api.delete(`/catalog/services/${id}/`).then((response) => response.data)
}

/* ----------------------------- Рабочие места ------------------------------ */

export function getWorkplaces(params = {}) {
  return api.get(`/catalog/workplaces/${toQuery(params)}`).then((response) => response.data)
}

export function createWorkplace(data) {
  return api.post('/catalog/workplaces/', data).then((response) => response.data)
}

export function updateWorkplace(id, data) {
  return api.patch(`/catalog/workplaces/${id}/`, data).then((response) => response.data)
}

export function deleteWorkplace(id) {
  return api.delete(`/catalog/workplaces/${id}/`).then((response) => response.data)
}

/* -------------------------------- Мастера --------------------------------- */

export function getMasters(params = {}) {
  return api.get(`/masters/${toQuery(params)}`).then((response) => response.data)
}

export function createMaster(data) {
  return api.post('/masters/', data).then((response) => response.data)
}

export function updateMaster(id, data) {
  return api.patch(`/masters/${id}/`, data).then((response) => response.data)
}

export function deleteMaster(id) {
  return api.delete(`/masters/${id}/`).then((response) => response.data)
}

/* -------------------------- Услуги/master inline -------------------------- */

export function getMasterServices(params = {}) {
  return api.get(`/masters/master-services/${toQuery(params)}`).then((response) => response.data)
}

export function createMasterService(data) {
  return api.post('/masters/master-services/', data).then((response) => response.data)
}

export function updateMasterService(id, data) {
  return api.patch(`/masters/master-services/${id}/`, data).then((response) => response.data)
}

export function deleteMasterService(id) {
  return api.delete(`/masters/master-services/${id}/`).then((response) => response.data)
}

/* ------------------------------ Расписание -------------------------------- */

export function getSchedules(params = {}) {
  return api.get(`/masters/schedules/${toQuery(params)}`).then((response) => response.data)
}

export function createSchedule(data) {
  return api.post('/masters/schedules/', data).then((response) => response.data)
}

export function updateSchedule(id, data) {
  return api.patch(`/masters/schedules/${id}/`, data).then((response) => response.data)
}

export function deleteSchedule(id) {
  return api.delete(`/masters/schedules/${id}/`).then((response) => response.data)
}

/* ------------------------------ Отсутствия -------------------------------- */

export function getAbsences(params = {}) {
  return api.get(`/masters/absences/${toQuery(params)}`).then((response) => response.data)
}

export function createAbsence(data) {
  return api.post('/masters/absences/', data).then((response) => response.data)
}

export function updateAbsence(id, data) {
  return api.patch(`/masters/absences/${id}/`, data).then((response) => response.data)
}

export function deleteAbsence(id) {
  return api.delete(`/masters/absences/${id}/`).then((response) => response.data)
}

/* -------------------------------- Записи ---------------------------------- */

export function getBookings(params = {}) {
  return api.get(`/bookings/bookings/${toQuery(params)}`).then((response) => response.data)
}

export function getBooking(id) {
  return api.get(`/bookings/bookings/${id}/`).then((response) => response.data)
}

export function getBookingHistory(id) {
  return api.get(`/bookings/bookings/${id}/history/`).then((response) => response.data)
}

/** Админское изменение статуса: обходит обычные ограничения переходов. */
export function setAdminStatus(id, status, comment = '') {
  return api
    .patch(`/bookings/bookings/${id}/admin-status/`, { status, comment })
    .then((response) => response.data)
}

export function cancelBooking(id) {
  return api.post(`/bookings/bookings/${id}/cancel/`).then((response) => response.data)
}

/* -------------------------------- Отзывы ---------------------------------- */

export function getReviews(params = {}) {
  return api.get(`/bookings/reviews/${toQuery(params)}`).then((response) => response.data)
}
