import { useEffect, useState } from 'react'
import { getServices } from '../api/services'

function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      try {
        const data = await getServices()

        if (isMounted) {
          setServices(data)
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

    loadServices()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <p>Загрузка услуг...</p>
  }

  if (error) {
    return <p>Не удалось загрузить услуги. Проверьте подключение к серверу</p>
  }

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Уход и красота
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Каталог услуг
      </h1>

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
    </section>
  )
}

export default Services