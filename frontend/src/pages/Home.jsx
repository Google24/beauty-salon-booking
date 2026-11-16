import { NavLink } from 'react-router-dom'

const benefits = [
  {
    title: 'Опытные мастера',
    description: 'Внимательно подбираем специалиста под ваши пожелания.',
  },
  {
    title: 'Премиальные материалы',
    description: 'Используем качественные продукты и заботимся о результате.',
  },
  {
    title: 'Удобная онлайн-запись',
    description: 'Выберите услугу, мастера и подходящее время за несколько минут.',
  },
  {
    title: 'Атмосфера заботы',
    description: 'Создаём пространство, где можно расслабиться и посвятить время себе.',
  },
]

function Home() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[2rem] bg-[var(--color-plum-deep)] px-6 py-16 text-[var(--color-white)] shadow-[0_20px_50px_rgba(74,48,71,0.2)] sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-blush)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-5 text-sm font-medium tracking-[0.24em] text-[var(--color-gold)] uppercase">
            Салон красоты
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Добро пожаловать в Atelier Beauté
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-sand)] sm:text-lg">
            Место, где профессиональный уход встречается с атмосферой спокойствия,
            красоты и внимания к каждой детали.
          </p>
          <NavLink
            to="/booking"
            className="mt-9 inline-flex rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-semibold text-[var(--color-plum-deep)] shadow-lg transition hover:bg-[var(--color-sand)]"
          >
            Записаться
          </NavLink>
        </div>
      </section>

      <section>
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
            Почему Atelier Beauté
          </p>
          <h2 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
            Красота, которой приятно доверять
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.08)] ring-1 ring-[var(--color-sand)]/70"
            >
              <div className="mb-5 h-2 w-12 rounded-full bg-[var(--color-gold)]" />
              <h3 className="text-lg font-semibold text-[var(--color-plum)]">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home