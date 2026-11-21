import { useEffect, useState } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import SkeletonCard from '../components/SkeletonCard'
import { getMasters } from '../api/masters'

const specializationLabels = {
  master_manicure: 'Мастер маникюра',
  master_pedicure: 'Мастер педикюра',
  master_manicure_pedicure: 'Мастер маникюра и педикюра',
  nail_design: 'Мастер дизайна ногтей',
}

function Masters() {
  const [searchParams] = useSearchParams()
  const serviceId = searchParams.get('service') || ''
  const [masters, setMasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadMasters() {
      setLoading(true)
      setError(false)
      try {
        const data = await getMasters(serviceId)
        const masterList = Array.isArray(data) ? data : data.results || []
        if (isMounted) setMasters(masterList)
      } catch {
        if (isMounted) setError(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMasters()
    return () => {
      isMounted = false
    }
  }, [serviceId])

  if (loading) {
    return (
      <section>
        <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">Команда салона</p>
        <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Наши мастера</h1>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 4 }, (_, index) => <SkeletonCard key={index} />)}</div>
      </section>
    )
  }

  if (error) return <p className="text-[#8e3f4a]">Не удалось загрузить мастеров</p>

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">Команда салона</p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Наши мастера</h1>
      {masters.length === 0 ? (
        <p className="mt-8 text-[var(--color-muted)]">Мастера не найдены</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {masters.map((master) => (
            <article key={master.id} className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
              <div className="flex items-center gap-4">
                {master.photo || master.image ? (
                  <img src={master.photo?.startsWith('http') ? master.photo : `http://127.0.0.1:8000${master.photo || master.image}`} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-blush)] text-lg font-semibold text-[var(--color-white)]">
                    {(master.display_name || master.name || 'Мастер').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                  </span>
                )}
                <h2 className="break-words text-xl font-semibold text-[var(--color-plum)]">{master.display_name || master.name || 'Мастер'}</h2>
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--color-gold)]">{specializationLabels[master.specialization] || master.specialization || 'Специалист салона'}</p>
              {(master.rating ?? master.average_rating) != null && <p className="mt-2 text-sm font-medium text-[var(--color-plum)]">Рейтинг: {Number(master.rating ?? master.average_rating).toFixed(1)} ★</p>}
              <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">{master.info || master.description || 'Информация о мастере пока не добавлена.'}</p>
              <NavLink to={`/booking?${serviceId ? `service=${encodeURIComponent(serviceId)}&` : ''}master=${encodeURIComponent(master.id)}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)]">Записаться</NavLink>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Masters