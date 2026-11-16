import { useEffect, useState } from 'react'
import { getServices } from '../api/services'

function Services() {
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true
    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      setError(false)

      try {
        const data = await getServices(search)

        if (isMounted) {
          setServices(data)
        }
      } catch {
        if (isMounted) {
          setError(true)
          setServices([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 400)

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
    }
  }, [search])

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Уход и красота
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Каталог услуг
      </h1>

      <label htmlFor="service-search" className="sr-only">
        Поиск услуг
      </label>
      <input
        id="service-search"
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Найти услугу"
        className="mt-6 w-full max-w-xl rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
      />

      {loading && <p className="mt-8">Загрузка услуг...</p>}
      {error && <p className="mt-8 text-[#8e3f4a]">Не удалось загрузить услуги. Проверьте подключение к серверу</p>}
      {!loading && !error && services.length === 0 && search.trim() && (
        <p className="mt-8 text-[var(--color-muted)]">По вашему запросу ничего не найдено</p>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const title = service.name || service.title || 'Услуга'
            const price = Number(service.price || 0)
            const duration = service.duration_min || service.duration

            return (
              <article
                key={service.id}
                className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
              >
                <h2 className="text-xl font-semibold text-[var(--color-plum)]">
                  {title}
                </h2>
                <p className="mt-5 text-2xl font-semibold text-[var(--color-plum-deep)]">
                  {price.toLocaleString('ru-RU')} ₽
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Длительность: {duration ? `${duration} мин` : 'не указана'}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Services