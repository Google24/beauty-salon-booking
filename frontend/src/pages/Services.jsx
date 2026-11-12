const draftServices = [
  {
    id: 1,
    title: 'Стрижка',
    price: 2500,
    duration: '60 мин',
  },
  {
    id: 2,
    title: 'Маникюр',
    price: 1800,
    duration: '75 мин',
  },
  {
    id: 3,
    title: 'Педикюр',
    price: 2200,
    duration: '90 мин',
  },
  {
    id: 4,
    title: 'Дизайн ногтей',
    price: 1200,
    duration: '45 мин',
  },
]

function Services() {
  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Уход и красота
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Каталог услуг
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {draftServices.map((service) => (
          <article
            key={service.id}
            className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
          >
            <h2 className="text-xl font-semibold text-[var(--color-plum)]">
              {service.title}
            </h2>
            <p className="mt-5 text-2xl font-semibold text-[var(--color-plum-deep)]">
              {service.price.toLocaleString('ru-RU')} ₽
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Длительность: {service.duration}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Services