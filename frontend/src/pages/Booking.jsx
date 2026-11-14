import { useState } from 'react'

const draftSlots = ['10:00', '12:30', '15:00']

function Booking() {
  const [date, setDate] = useState('')
  const [showSlots, setShowSlots] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setShowSlots(true)
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
            className="shrink-0 rounded-xl bg-[var(--color-plum)] px-5 py-3 font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)]"
          >
            Показать свободное время
          </button>
        </div>
      </form>

      {showSlots && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-[var(--color-plum)]">
            Доступное время
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {draftSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                className="rounded-xl border border-[var(--color-plum)] bg-[var(--color-white)] px-5 py-3 font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-plum)] hover:text-[var(--color-white)]"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default Booking