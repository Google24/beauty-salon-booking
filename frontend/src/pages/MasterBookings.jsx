import { useEffect, useState } from 'react'
import { getMasterBookings } from '../api/bookings'
import { useAuth } from '../context/AuthContext.jsx'

const statusLabels = { new: 'Новая', confirmed: 'Подтверждена', in_progress: 'В процессе', done: 'Выполнена', cancelled: 'Отменена', no_show: 'Клиент не пришёл' }

function MasterBookings() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadBookings() {
      if (!token) return setLoading(false)
      try {
        const data = await getMasterBookings(token)
        const list = Array.isArray(data) ? data : data.results || []
        if (isMounted) setBookings([...list].sort((a, b) => new Date(b.start_at) - new Date(a.start_at)))
      } catch {
        if (isMounted) setError(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadBookings()
    return () => { isMounted = false }
  }, [token])

  if (loading) return <p>Загрузка записей...</p>
  if (error) return <p className="text-[#8e3f4a]" role="alert">Не удалось загрузить записи</p>

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">Кабинет мастера</p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Записи клиентов</h1>
      {bookings[0]?.workplace_name && <p className="mt-3 text-sm text-[var(--color-muted)]">Рабочее место: <span className="font-medium text-[var(--color-plum)]">{bookings[0].workplace_name}</span></p>}
      {bookings.length === 0 ? <p className="mt-8 text-[var(--color-muted)]">У вас пока нет записей</p> : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {bookings.map((booking) => {
            const date = new Date(booking.start_at)
            const services = (booking.services || []).map((service) => service.service_name).join(', ')
            const client = [booking.client_first_name, booking.client_last_name].filter(Boolean).join(' ') || booking.client_email || `Клиент #${booking.client}`
            return <article key={booking.id} className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
              <div className="flex items-start justify-between gap-4"><div><p className="text-lg font-semibold text-[var(--color-plum)]">{date.toLocaleDateString('ru-RU')}</p><p className="mt-1 text-sm text-[var(--color-muted)]">{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p></div><span className="rounded-full bg-[var(--color-sand)]/60 px-3 py-1 text-xs font-medium text-[var(--color-plum)]">{statusLabels[booking.status] || booking.status}</span></div>
              <dl className="mt-5 space-y-3 text-sm"><div><dt className="text-[var(--color-muted)]">Услуга</dt><dd className="mt-1 font-medium">{services || 'Услуга не указана'}</dd></div><div><dt className="text-[var(--color-muted)]">Клиент</dt><dd className="mt-1 font-medium">{client}</dd></div><div><dt className="text-[var(--color-muted)]">Комментарий</dt><dd className="mt-1">{booking.comment || 'Комментарий отсутствует'}</dd></div></dl>
            </article>
          })}
        </div>
      )}
    </section>
  )
}

export default MasterBookings