import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getAdminBookings, updateBookingStatus } from '../api/admin'
import { useAuth } from '../context/AuthContext.jsx'

const statusLabels = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  in_progress: 'В процессе',
  done: 'Выполнена',
  cancelled: 'Отменена',
  no_show: 'Клиент не пришёл',
}

const statuses = Object.keys(statusLabels)

function getBookingsList(data) {
  return Array.isArray(data) ? data : data?.results || []
}

function getClientName(booking) {
  const name = [booking.client_first_name, booking.client_last_name].filter(Boolean).join(' ')
  return name || booking.client_email || `Клиент #${booking.client}`
}

function getMasterName(booking) {
  return booking.master_name || booking.master_display_name || `Мастер #${booking.master}`
}

function AdminBookings() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [draftStatuses, setDraftStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadBookings() {
      try {
        const data = await getAdminBookings(token)
        const bookingList = getBookingsList(data)
        if (isMounted) {
          setBookings(bookingList)
          setDraftStatuses(Object.fromEntries(bookingList.map((booking) => [booking.id, booking.status])))
        }
      } catch {
        if (isMounted) setError('Не удалось загрузить записи')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadBookings()
    return () => {
      isMounted = false
    }
  }, [token])

  async function handleStatusSave(bookingId) {
    const status = draftStatuses[bookingId]
    setSavingId(bookingId)

    try {
      const updatedBooking = await updateBookingStatus(bookingId, status, token)
      setBookings((current) => current.map((booking) => (
        booking.id === bookingId ? { ...booking, ...updatedBooking, status } : booking
      )))
      toast.success('Статус записи обновлён')
    } catch (requestError) {
      const responseData = requestError.data
      const serverError = responseData?.detail || Object.values(responseData || {})[0]?.[0] || 'Не удалось изменить статус'
      toast.error(serverError)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">Администрирование</p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Записи</h1>

      {loading && <p className="mt-8 text-[var(--color-muted)]">Загрузка записей...</p>}
      {error && <p className="mt-8 text-[#8e3f4a]" role="alert">{error}</p>}
      {!loading && !error && (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-[var(--color-white)] shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
          <table className="w-full min-w-[900px] text-left text-sm">
            <caption className="sr-only">Все записи клиентов</caption>
            <thead className="border-b border-[var(--color-sand)]/80 text-xs tracking-[0.12em] text-[var(--color-muted)] uppercase">
              <tr>
                <th className="px-5 py-4 font-medium">Дата</th>
                <th className="px-5 py-4 font-medium">Клиент</th>
                <th className="px-5 py-4 font-medium">Мастер</th>
                <th className="px-5 py-4 font-medium">Услуга</th>
                <th className="px-5 py-4 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-sand)]/60">
              {bookings.map((booking) => {
                const startDate = new Date(booking.start_at)
                const serviceNames = (booking.services || []).map((service) => service.service_name).join(', ')
                return (
                  <tr key={booking.id}>
                    <td className="px-5 py-4 font-medium text-[var(--color-plum)]">
                      {startDate.toLocaleDateString('ru-RU')} {startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-4">{getClientName(booking)}</td>
                    <td className="px-5 py-4">{getMasterName(booking)}</td>
                    <td className="px-5 py-4">{serviceNames || 'Услуга не указана'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={draftStatuses[booking.id] || booking.status}
                          onChange={(event) => setDraftStatuses((current) => ({ ...current, [booking.id]: event.target.value }))}
                          disabled={savingId === booking.id}
                          className="min-h-10 rounded-lg border border-[var(--color-sand)] bg-[var(--color-ivory)] px-3 text-sm text-[var(--color-plum)]"
                        >
                          {statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleStatusSave(booking.id)}
                          disabled={savingId === booking.id || draftStatuses[booking.id] === booking.status}
                          className="rounded-lg bg-[var(--color-plum)] px-3 py-2 text-xs font-medium text-[var(--color-white)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingId === booking.id ? '...' : 'Сохранить'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="px-5 py-8 text-center text-[var(--color-muted)]">Записи не найдены</p>}
        </div>
      )}
    </section>
  )
}

export default AdminBookings