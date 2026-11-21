import { getErrorMessage as getApiErrorMessage } from '../api/api'

export const STATUS_LABELS = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  in_progress: 'В процессе',
  done: 'Выполнена',
  cancelled: 'Отменена',
  no_show: 'Клиент не пришёл',
}

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const ROLE_LABELS = {
  client: 'Клиент',
  master: 'Мастер',
  admin: 'Администратор',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export const WEEKDAYS = [
  { value: 0, label: 'Понедельник' },
  { value: 1, label: 'Вторник' },
  { value: 2, label: 'Среда' },
  { value: 3, label: 'Четверг' },
  { value: 4, label: 'Пятница' },
  { value: 5, label: 'Суббота' },
  { value: 6, label: 'Воскресенье' },
]

export const WORKPLACE_TYPES = {
  any: 'Любое',
  manicure_table: 'Маникюрный стол',
  pedicure_chair: 'Педикюрное кресло',
}

export const SPECIALIZATION_LABELS = {
  master_manicure: 'Мастер маникюра',
  master_pedicure: 'Мастер педикюра',
  master_manicure_pedicure: 'Мастер маникюра и педикюра',
  nail_design: 'Мастер дизайна ногтей',
}

export const ABSENCE_REASONS = {
  vacation: 'Отпуск',
  sick_leave: 'Больничный',
  other: 'Другое',
}

export function formatMoney(value) {
  const amount = Number(value || 0)

  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽`
}

export function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('ru-RU')
}

export function formatTime(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 5)
  }

  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function errorText(error, fallback) {
  return getApiErrorMessage(error, fallback)
}

export function toFormData(data, fileField, file) {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    formData.append(key, String(value))
  })

  if (file) {
    formData.append(fileField, file)
  }

  return formData
}

export function fullName(user) {
  if (!user) return '—'

  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '—'
}
