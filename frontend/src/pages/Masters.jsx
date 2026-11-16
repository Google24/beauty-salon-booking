import { useEffect, useState } from 'react'
import SkeletonCard from '../components/SkeletonCard'
import { getMasters } from '../api/masters'

const specializationLabels = {
  master_manicure: 'Мастер маникюра',
  master_pedicure: 'Мастер педикюра',
  master_manicure_pedicure: 'Мастер маникюра и педикюра',
  nail_design: 'Мастер дизайна ногтей',
}

function Masters() {
  const [masters, setMasters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMasters()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <section>
        <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
          Команда салона
        </p>
        <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
          Наши мастера
        </h1>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return <p className="text-[#8e3f4a]">Не удалось загрузить мастеров</p>
  }

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Команда салона
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Наши мастера
      </h1>

      {masters.length === 0 ? (
        <p className="mt-8 text-[var(--color-muted)]">Мастера не найдены</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {masters.map((master) => (
            <article
              key={master.id}
              className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
            >
              <h2 className="break-words text-xl font-semibold text-[var(--color-plum)]">
                {master.display_name || master.name || 'Мастер'}
              </h2>
              <p className="mt-2 text-sm font-medium text-[var(--color-gold)]">
                {specializationLabels[master.specialization] || master.specialization || 'Специалист салона'}
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                {master.info || master.description || 'Информация о мастере пока не добавлена.'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Masters