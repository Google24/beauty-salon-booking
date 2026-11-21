import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPublicReviews } from '../api/bookings'
import { getMasters } from '../api/masters'

const RATING_FILTERS = [
  { value: '', label: 'Все' },
  { value: '5', label: '5 ★' },
  { value: '4', label: '4 ★' },
  { value: '3', label: '3 ★' },
]

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function Reviews() {
  const [searchParams] = useSearchParams()
  const [reviews, setReviews] = useState([])
  const [masters, setMasters] = useState([])
  const [ratingFilter, setRatingFilter] = useState('')
  const [masterFilter, setMasterFilter] = useState(() => searchParams.get('master') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getMasters()
      .then((data) => setMasters(Array.isArray(data) ? data : data.results || []))
      .catch(() => setMasters([]))
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadReviews() {
      setLoading(true)
      setError(false)

      try {
        const params = {
          ...(ratingFilter ? { rating: ratingFilter } : {}),
          ...(masterFilter ? { master: masterFilter } : {}),
        }
        const data = await getPublicReviews(params)
        const list = Array.isArray(data) ? data : data.results || []

        if (isMounted) {
          setReviews(list)
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

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [ratingFilter, masterFilter])

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : null

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Голоса наших гостей
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Отзывы
      </h1>
      <p className="mt-3 max-w-xl text-sm text-[var(--color-muted)]">
        Мнения клиентов о работе мастеров салона. Отзыв можно оставить в личном
        кабинете после завершённой записи.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl bg-[var(--color-white)] p-5 shadow-[0_14px_35px_rgba(74,48,71,0.08)] ring-1 ring-[var(--color-sand)]/70">
        {averageRating !== null && (
          <div>
            <p className="text-3xl font-semibold text-[var(--color-plum)]">
              {averageRating.toFixed(1)} <span className="text-xl text-[var(--color-gold)]">★</span>
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              на основе {reviews.length} {reviews.length === 1 ? 'отзыва' : 'отзывов'}
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по оценке">
          {RATING_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={ratingFilter === filter.value}
              onClick={() => setRatingFilter(filter.value)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                ratingFilter === filter.value
                  ? 'bg-[var(--color-plum)] text-white'
                  : 'bg-[var(--color-ivory)] text-[var(--color-muted)] hover:text-[var(--color-plum)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <label className="ml-auto block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
          Мастер
          <select
            value={masterFilter}
            onChange={(event) => setMasterFilter(event.target.value)}
            className="mt-1 min-h-10 w-full min-w-44 rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-3 text-sm text-[var(--color-ink)] normal-case outline-none focus:border-[var(--color-plum)]"
          >
            <option value="">Все мастера</option>
            {masters.map((master) => (
              <option key={master.id} value={master.id}>
                {master.display_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="mt-8 text-[var(--color-muted)]">Загрузка отзывов...</p>
      ) : error ? (
        <p className="mt-8 text-[#8e3f4a]">Не удалось загрузить отзывы</p>
      ) : reviews.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-[var(--color-white)] p-8 text-center shadow ring-1 ring-[var(--color-sand)]/70">
          <p className="text-lg font-medium text-[var(--color-plum)]">Отзывов пока нет</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Станьте первым — оставьте отзыв после визита в личном кабинете.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.08)] ring-1 ring-[var(--color-sand)]/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[var(--color-plum)]">
                    {review.client_display}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {formatDate(review.created_at)}
                  </p>
                </div>
                <span
                  className="text-lg text-[var(--color-gold)]"
                  aria-label={`Оценка ${review.rating} из 5`}
                >
                  {'★'.repeat(Number(review.rating))}
                  <span className="text-[var(--color-sand)]">
                    {'★'.repeat(5 - Number(review.rating))}
                  </span>
                </span>
              </div>
              {review.master_name && (
                <p className="mt-3 text-xs text-[var(--color-muted)]">
                  Мастер: <span className="font-medium text-[var(--color-plum)]">{review.master_name}</span>
                </p>
              )}
              {review.text && (
                <p className="mt-3 flex-1 text-sm leading-6 text-[var(--color-ink)]">
                  {review.text}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Reviews
