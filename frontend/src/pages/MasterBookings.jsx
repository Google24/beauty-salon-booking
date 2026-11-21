import { useEffect, useMemo, useState } from 'react'
import { getMasterBookings } from '../api/bookings'
import { useAuth } from '../context/AuthContext.jsx'

const statusLabels = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  in_progress: 'В процессе',
  done: 'Выполнена',
  cancelled: 'Отменена',
  no_show: 'Клиент не пришёл',
}

const statusStyles = {
  new: 'bg-[var(--color-sand)]/70 text-[var(--color-plum)]',
  confirmed: 'bg-[var(--color-plum)]/10 text-[var(--color-plum-deep)]',
  in_progress: 'bg-[var(--color-gold)]/25 text-[#8a6a2f]',
  done: 'bg-[#dfeadd] text-[#3f7659]',
  cancelled: 'bg-[#f1dfe1] text-[#8e3f4a]',
  no_show: 'bg-[var(--color-blush)]/25 text-[#8e3f4a]',
}

const statusOrder = ['new', 'confirmed', 'in_progress', 'done', 'cancelled', 'no_show']

const sortOptions = [
  { value: 'upcoming', label: 'Сначала ближайшие' },
  { value: 'latest', label: 'Сначала поздние' },
  { value: 'earliest', label: 'Сначала ранние' },
]

function getStartTime(booking) {
  return new Date(booking.start_at).getTime()
}

function compareUpcoming(first, second, now = Date.now()) {
  const firstStart = getStartTime(first)
  const secondStart = getStartTime(second)
  const firstFuture = firstStart >= now
  const secondFuture = secondStart >= now

  if (firstFuture !== secondFuture) return firstFuture ? -1 : 1

  return firstFuture ? firstStart - secondStart : secondStart - firstStart
}

const comparators = {
  upcoming: compareUpcoming,
  latest: (first, second) => getStartTime(second) - getStartTime(first),
  earliest: (first, second) => getStartTime(first) - getStartTime(second),
}

function sortBookings(bookings, sort, now) {
  const comparator = comparators[sort] || compareUpcoming

  return [...bookings].sort((first, second) => comparator(first, second, now))
}

function dayKey(date) {
  const local = new Date(date)
  const year = local.getFullYear()
  const month = String(local.getMonth() + 1).padStart(2, '0')
  const day = String(local.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDayLabel(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const day = new Date(date)
  day.setHours(0, 0, 0, 0)

  const diffDays = Math.round((day.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Завтра'
  if (diffDays === -1) return 'Вчера'

  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(date) {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function groupByDay(bookings) {
  const groups = []

  bookings.forEach((booking) => {
    const key = dayKey(booking.start_at)
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && lastGroup.key === key) {
      lastGroup.items.push(booking)
      return
    }

    groups.push({
      key,
      label: formatDayLabel(new Date(booking.start_at)),
      items: [booking],
    })
  })

  return groups
}

function MasterBookings() {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('upcoming')
  const [nowMs, setNowMs] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadBookings() {
      if (!token) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(false)

      try {
        const data = await getMasterBookings(token)
        const list = Array.isArray(data) ? data : data.results || []

        if (isMounted) {
          setBookings(list)
          setNowMs(Date.now())
        }
      } catch {
        if (isMounted) setError(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadBookings()

    return () => {
      isMounted = false
    }
  }, [token, reloadKey])

  const visibleBookings = useMemo(() => {
    const filtered =
      statusFilter === 'all'
        ? bookings
        : bookings.filter((booking) => booking.status === statusFilter)

    return sortBookings(filtered, sort, nowMs)
  }, [bookings, statusFilter, sort, nowMs])

  const groups = useMemo(() => groupByDay(visibleBookings), [visibleBookings])

  const countsByStatus = useMemo(() => {
    const counts = { all: bookings.length }

    bookings.forEach((booking) => {
      counts[booking.status] = (counts[booking.status] || 0) + 1
    })

    return counts
  }, [bookings])

  const summary = useMemo(() => {
    const todayKey = dayKey(nowMs)

    return {
      today: bookings.filter((booking) => dayKey(booking.start_at) === todayKey).length,
      upcoming: bookings.filter((booking) => getStartTime(booking) >= nowMs).length,
      done: bookings.filter((booking) => booking.status === 'done').length,
    }
  }, [bookings, nowMs])

  if (loading) {
    return <p className="text-[var(--color-muted)]">Загрузка записей...</p>
  }

  if (error) {
    return (
      <p className="text-[#8e3f4a]" role="alert">
        Не удалось загрузить записи
      </p>
    )
  }

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Кабинет мастера
      </p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
            Записи клиентов
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Всего записей: <span className="font-medium text-[var(--color-plum)]">{countsByStatus.all}</span>
            <span className="mx-2 text-[var(--color-sand)]">|</span>
            сегодня: <span className="font-medium text-[var(--color-plum)]">{summary.today}</span>
            <span className="mx-2 text-[var(--color-sand)]">|</span>
            предстоящих: <span className="font-medium text-[var(--color-plum)]">{summary.upcoming}</span>
            <span className="mx-2 text-[var(--color-sand)]">|</span>
            выполнено: <span className="font-medium text-[var(--color-plum)]">{summary.done}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="min-h-11 rounded-xl border border-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-plum)] hover:text-[var(--color-white)]"
        >
          Обновить
        </button>
      </div>

      <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-[var(--color-white)] p-4 ring-1 ring-[var(--color-sand)]/70 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase">
            Статус
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            aria-pressed={statusFilter === 'all'}
            className={`min-h-9 rounded-full px-3 py-1 text-xs font-medium transition ${
              statusFilter === 'all'
                ? 'bg-[var(--color-plum)] text-[var(--color-white)]'
                : 'bg-[var(--color-sand)]/50 text-[var(--color-plum)] hover:bg-[var(--color-sand)]/80'
            }`}
          >
            Все ({countsByStatus.all})
          </button>
          {statusOrder
            .filter((status) => countsByStatus[status])
            .map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={`min-h-9 rounded-full px-3 py-1 text-xs font-medium transition ${
                  statusFilter === status
                    ? 'bg-[var(--color-plum)] text-[var(--color-white)]'
                    : 'bg-[var(--color-sand)]/50 text-[var(--color-plum)] hover:bg-[var(--color-sand)]/80'
                }`}
              >
                {statusLabels[status]} ({countsByStatus[status]})
              </button>
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-sand)]/60 pt-4">
          <label
            htmlFor="master-bookings-sort"
            className="text-xs font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase"
          >
            Сортировка по дате
          </label>
          <select
            id="master-bookings-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="min-h-10 rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-plum)] focus:ring-2 focus:ring-[var(--color-plum)]/15"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-[var(--color-muted)]">
            Показано: {visibleBookings.length} из {bookings.length}
          </span>
        </div>
      </div>

      {bookings.length === 0 && (
        <p className="mt-8 text-[var(--color-muted)]">У вас пока нет записей</p>
      )}

      {bookings.length > 0 && visibleBookings.length === 0 && (
        <p className="mt-8 text-[var(--color-muted)]">
          Нет записей с выбранным статусом.
        </p>
      )}

      {groups.map((group) => (
        <div key={group.key} className="mt-8">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold tracking-[0.12em] text-[var(--color-gold)] uppercase">
              {group.label}
            </h2>
            <span className="h-px flex-1 bg-[var(--color-sand)]/80" />
            <span className="text-xs text-[var(--color-muted)]">{group.items.length}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            {group.items.map((booking) => {
              const startDate = new Date(booking.start_at)
              const endDate = booking.end_at ? new Date(booking.end_at) : null
              const services = (booking.services || [])
                .map((service) => service.service_name)
                .join(', ')
              const client =
                [booking.client_first_name, booking.client_last_name]
                  .filter(Boolean)
                  .join(' ') ||
                booking.client_email ||
                `Клиент #${booking.client}`

              return (
                <article
                  key={booking.id}
                  className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-plum)]">
                        {formatTime(startDate)}
                        {endDate && (
                          <span className="text-[var(--color-muted)]"> — {formatTime(endDate)}</span>
                        )}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-sand)]/45 px-3 py-1 text-xs font-medium text-[var(--color-plum)]">
                        <span aria-hidden="true">◇</span>
                        {booking.workplace_name || 'Рабочее место не указано'}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[booking.status] || 'bg-[var(--color-sand)]/60 text-[var(--color-plum)]'
                      }`}
                    >
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </div>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div>
                      <dt className="text-[var(--color-muted)]">Услуга</dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">
                        {services || 'Услуга не указана'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted)]">Клиент</dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">{client}</dd>
                      {booking.client_phone && (
                        <dd className="mt-1 text-xs text-[var(--color-muted)]">{booking.client_phone}</dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted)]">Стоимость</dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">
                        {booking.total_price != null
                          ? `${Number(booking.total_price).toLocaleString('ru-RU')} ₽`
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--color-muted)]">Комментарий</dt>
                      <dd className="mt-1 text-[var(--color-ink)]">
                        {booking.comment || 'Комментарий отсутствует'}
                      </dd>
                    </div>
                  </dl>
                </article>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}

export default MasterBookings
