import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBooking, getSlots } from '../api/bookings'
import { getMasters } from '../api/masters'
import { useAuth } from '../context/AuthContext.jsx'

function Booking() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [masters, setMasters] = useState([])
  const [selectedMasterId, setSelectedMasterId] = useState('')
  const [mastersLoading, setMastersLoading] = useState(true)
  const [mastersError, setMastersError] = useState(false)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [success, setSuccess] = useState('')
  const [showSlots, setShowSlots] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadMasters() {
      try {
        const data = await getMasters()
        const masterList = Array.isArray(data) ? data : data.results || []

        if (isMounted) {
          setMasters(masterList)
        }
      } catch {
        if (isMounted) {
          setMastersError(true)
        }
      } finally {
        if (isMounted) {
          setMastersLoading(false)
        }
      }
    }

    loadMasters()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedMasterId) {
      setError('Сначала выберите мастера')
      return
    }

    setLoading(true)
    setError('')
    setBookingError('')
    setSuccess('')
    setSelectedSlot(null)
    setShowSlots(true)

    try {
      // Услуга пока временно фиксирована: выбор услуги добавим следующим шагом.
      const data = await getSlots(Number(selectedMasterId), 1, date)
      setSlots(Array.isArray(data) ? data : data.results || [])
    } catch {
      setSlots([])
      setError('Слоты не найдены или ошибка сервера')
    } finally {
      setLoading(false)
    }
  }

  function handleMasterChange(event) {
    setSelectedMasterId(event.target.value)
    setSlots([])
    setSelectedSlot(null)
    setShowSlots(false)
    setError('')
  }

  function handleSlotSelect(slot) {
    setSelectedSlot(slot)
    setBookingError('')
    setSuccess('')
  }

  async function handleBookingConfirm() {
    if (!selectedSlot || !token) {
      setBookingError('Для создания записи необходимо войти в аккаунт.')
      return
    }

    setBookingLoading(true)
    setBookingError('')

    try {
      await createBooking(
        {
          master: Number(selectedMasterId),
          service_ids: [1],
          workplace: selectedSlot.workplace_id,
          start_at: selectedSlot.start_at,
          comment: '',
        },
        token,
      )
      setSuccess('Вы успешно записаны!')
      window.setTimeout(() => navigate('/profile'), 800)
    } catch (requestError) {
      const responseData = requestError.data
      const serverError =
        responseData?.detail ||
        Object.values(responseData || {})[0]?.[0] ||
        'Не удалось создать запись. Попробуйте выбрать другое время.'
      setBookingError(serverError)
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Онлайн-запись
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Выберите удобное время
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
      >
        <label
          htmlFor="booking-master"
          className="mb-2 block text-sm font-medium text-[var(--color-plum)]"
        >
          Мастер
        </label>
        {mastersLoading && <p className="mb-4 text-sm text-[var(--color-muted)]">Загрузка мастеров...</p>}
        {mastersError && <p className="mb-4 text-sm text-[#8e3f4a]">Не удалось загрузить мастеров</p>}
        {!mastersLoading && !mastersError && masters.length === 0 && (
          <p className="mb-4 text-sm text-[var(--color-muted)]">Мастера не найдены</p>
        )}
        {!mastersLoading && !mastersError && masters.length > 0 && (
          <select
            id="booking-master"
            value={selectedMasterId}
            onChange={handleMasterChange}
            className="mb-5 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
          >
            <option value="">Выберите мастера</option>
            {masters.map((master) => (
              <option key={master.id} value={master.id}>
                {master.display_name || master.name || `Мастер #${master.id}`}
              </option>
            ))}
          </select>
        )}

        <label
          htmlFor="booking-date"
          className="mb-2 block text-sm font-medium text-[var(--color-plum)]"
        >
          Дата записи
        </label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <input
            id="booking-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
          />
          <button
            type="submit"
            disabled={loading || mastersLoading || !selectedMasterId}
            className="shrink-0 rounded-xl bg-[var(--color-plum)] px-5 py-3 font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Показать свободное время
          </button>
        </div>
        {!selectedMasterId && !mastersLoading && masters.length > 0 && (
          <p className="mt-3 text-sm text-[var(--color-muted)]">Сначала выберите мастера</p>
        )}
      </form>

      {showSlots && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[var(--color-plum)]">
            Доступное время
          </h2>

          {loading && <p className="mt-4 text-[var(--color-muted)]">Загрузка слотов...</p>}
          {error && <p className="mt-4 text-[#8e3f4a]">{error}</p>}
          {!loading && !error && slots.length === 0 && (
            <p className="mt-4 text-[var(--color-muted)]">Нет свободного времени на эту дату</p>
          )}

          {!loading && !error && slots.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {slots.map((slot) => (
                <button
                  key={slot.start_at}
                  type="button"
                  onClick={() => handleSlotSelect(slot)}
                  className={`rounded-xl border px-5 py-3 font-medium transition ${
                    selectedSlot?.start_at === slot.start_at
                      ? 'border-[var(--color-gold)] bg-[var(--color-plum)] text-[var(--color-white)]'
                      : 'border-[var(--color-plum)] bg-[var(--color-white)] text-[var(--color-plum)] hover:bg-[var(--color-plum)] hover:text-[var(--color-white)]'
                  }`}
                >
                  {new Date(slot.start_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-6 rounded-2xl bg-[var(--color-white)] p-5 ring-1 ring-[var(--color-sand)]/70">
              <p className="text-sm text-[var(--color-muted)]">
                Выбрано время:{' '}
                <span className="font-semibold text-[var(--color-plum)]">
                  {new Date(selectedSlot.start_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
              <button
                type="button"
                onClick={handleBookingConfirm}
                disabled={bookingLoading}
                className="mt-4 rounded-xl bg-[var(--color-gold)] px-5 py-3 font-medium text-[var(--color-plum-deep)] transition hover:bg-[var(--color-blush)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading ? 'Подтверждение...' : 'Подтвердить запись'}
              </button>
            </div>
          )}

          {success && <p className="mt-4 text-[#3f7659]">{success}</p>}
          {bookingError && <p className="mt-4 text-[#8e3f4a]">{bookingError}</p>}
        </div>
      )}
    </section>
  )
}

export default Booking