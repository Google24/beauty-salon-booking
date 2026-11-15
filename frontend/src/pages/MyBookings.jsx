import { useEffect, useState } from 'react'
import { getMyBookings } from '../api/bookings'
import { useAuth } from '../context/AuthContext.jsx'

const statusLabels = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  in_progress: 'В процессе',
  done: 'Выполнена',
  cancelled: 'Отменена',
  no_show: 'Клиент не пришёл',
}

function MyBookings() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadBookings() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await getMyBookings(token)
        const bookingList = Array.isArray(data) ? data : data.results || []

        if (isMounted) {
          setBookings(bookingList)
        }
      } catch {
        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      isMounted = false
    }
  }, [token])

  if (!token) {
    return <p>Войдите, чтобы посмотреть свои записи</p>
  }

  if (loading) {
    return <p>Загрузка записей...</p>
  }

  if (error) {
    return <p className="text-[#8e3f4a]">Не удалось загрузить записи</p>
  }

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Личный кабинет
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Мои записи
      </h1>

      {bookings.length === 0 ? (
        <p className="mt-8 text-[var(--color-muted)]">У вас пока нет записей</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {bookings.map((booking) => {
            const startDate = new Date(booking.start_at)
            const services = booking.services || []
            const serviceNames = services.map((service) => service.service_name).join(', ')

            return (
              <article
                key={booking.id}
                className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[var(--color-plum)]">
                      {startDate.toLocaleDateString('ru-RU')}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {startDate.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-sand)]/60 px-3 py-1 text-xs font-medium text-[var(--color-plum)]">
                    {statusLabels[booking.status] || booking.status}
                  </span>
                </div>
                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="text-[var(--color-muted)]">Услуга</dt>
                    <dd className="mt-1 font-medium text-[var(--color-ink)]">
                      {serviceNames || 'Услуга не указана'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted)]">Мастер</dt>
                    <dd className="mt-1 font-medium text-[var(--color-ink)]">
                      {booking.master_name || booking.master_display_name || `Мастер #${booking.master}`}
                    </dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default MyBookings