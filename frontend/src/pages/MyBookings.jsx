import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import toast from 'react-hot-toast'
import { cancelBooking, createReview, getMyBookings } from '../api/bookings'
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
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [reviewBookingId, setReviewBookingId] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

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
          setBookings([...bookingList].sort((first, second) => {
            const firstFuture = new Date(first.start_at) >= new Date()
            const secondFuture = new Date(second.start_at) >= new Date()
            if (firstFuture !== secondFuture) return firstFuture ? -1 : 1
            return secondFuture
              ? new Date(first.start_at) - new Date(second.start_at)
              : new Date(second.start_at) - new Date(first.start_at)
          }))
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

  function openReviewModal(bookingId) {
    setReviewBookingId(bookingId)
    setReviewRating(0)
    setReviewText('')
  }

  function closeReviewModal() {
    if (!reviewSubmitting) {
      setReviewBookingId(null)
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault()

    if (!reviewRating) {
      toast.error('Выберите оценку от 1 до 5')
      return
    }

    setReviewSubmitting(true)
    try {
      await createReview(reviewBookingId, { rating: reviewRating, text: reviewText }, token)
      setReviewBookingId(null)
      toast.success('Спасибо за отзыв!')
    } catch (requestError) {
      const responseData = requestError.data
      const serverError =
        responseData?.detail ||
        Object.values(responseData || {})[0]?.[0] ||
        'Не удалось отправить отзыв'
      toast.error(serverError)
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function handleCancel(bookingId) {
    if (!window.confirm('Вы действительно хотите отменить запись?')) {
      return
    }

    setCancellingId(bookingId)
    setActionError('')
    setSuccess('')

    try {
      const updatedBooking = await cancelBooking(bookingId, token)
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, ...updatedBooking, status: 'cancelled' }
            : booking,
        ),
      )
      toast.success('Запись отменена')
    } catch (requestError) {
      const responseData = requestError.data
      const serverError =
        responseData?.detail ||
        Object.values(responseData || {})[0]?.[0] ||
        'Не удалось отменить запись'
      toast.error(serverError)
    } finally {
      setCancellingId(null)
    }
  }

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
      <NavLink to="/profile" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-plum)] hover:text-[var(--color-gold)]">
        <span aria-hidden="true">←</span> Назад в личный кабинет
      </NavLink>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Личный кабинет
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Мои записи
      </h1>

      {success && <p className="mt-5 text-[#3f7659]" role="status">{success}</p>}
      {actionError && <p className="mt-5 text-[#8e3f4a]" role="alert">{actionError}</p>}

      {bookings.length === 0 ? (
        <p className="mt-8 text-[var(--color-muted)]">У вас пока нет записей</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {bookings.map((booking) => {
            const startDate = new Date(booking.start_at)
            const services = booking.services || []
            const serviceNames = services.map((service) => service.service_name).join(', ')
            const canCancel = booking.status === 'new' || booking.status === 'confirmed'

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
                    <dt className="text-[var(--color-muted)]">Стоимость</dt>
                     <dd className="mt-1 font-medium text-[var(--color-ink)]">{booking.total_price != null ? `${Number(booking.total_price).toLocaleString('ru-RU')} ₽` : '—'}</dd>
                   </div>
                   <div>
                     <dt className="text-[var(--color-muted)]">Мастер</dt>
                    <dd className="mt-1 font-medium text-[var(--color-ink)]">
                      {booking.master_name || booking.master_display_name || `Мастер #${booking.master}`}
                    </dd>
                  </div>
                </dl>
                {booking.status === 'done' && (
                  <button
                    type="button"
                    onClick={() => openReviewModal(booking.id)}
                    className="mt-6 min-h-11 w-full rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)] sm:w-auto"
                  >
                    Оставить отзыв
                  </button>
                )}
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="mt-6 min-h-11 w-full rounded-xl border sm:w-auto border-[#8e3f4a] px-4 py-2 text-sm font-medium text-[#8e3f4a] transition hover:bg-[#8e3f4a] hover:text-[var(--color-white)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancellingId === booking.id ? 'Отмена...' : 'Отменить'}
                  </button>
                )}
              </article>
            )
          })}
        </div>
      )}
      {reviewBookingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReviewModal()
          }}
        >
          <form
            onSubmit={handleReviewSubmit}
            className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-6 shadow-2xl"
          >
            <h2 id="review-modal-title" className="text-2xl font-semibold text-[var(--color-plum-deep)]">
              Оставить отзыв
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">Оцените работу мастера</p>

            <fieldset className="mt-5">
              <legend className="text-sm font-medium text-[var(--color-plum)]">Ваша оценка</legend>
              <div className="mt-2 flex gap-1" aria-label="Оценка от 1 до 5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} ${star === 1 ? 'звезда' : 'звезды'}`}
                    aria-pressed={reviewRating === star}
                    onClick={() => setReviewRating(star)}
                    className={`text-3xl transition ${star <= reviewRating ? 'text-[var(--color-gold)]' : 'text-[var(--color-sand)]'} hover:scale-110`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </fieldset>

            <label htmlFor="review-text" className="mt-5 block text-sm font-medium text-[var(--color-plum)]">
              Комментарий
            </label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              rows="4"
              placeholder="Расскажите о вашем опыте"
              className="mt-2 w-full resize-y rounded-xl border border-[var(--color-sand)] bg-[var(--color-cream)] px-4 py-3 text-sm outline-none focus:border-[var(--color-plum)] focus:ring-2 focus:ring-[var(--color-plum)]/15"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeReviewModal}
                disabled={reviewSubmitting}
                className="min-h-11 rounded-xl border border-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-plum)] hover:text-[var(--color-white)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="min-h-11 rounded-xl bg-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reviewSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default MyBookings