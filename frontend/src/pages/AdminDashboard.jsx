import { NavLink } from 'react-router-dom'

const dashboardCards = [
  { title: 'Пользователи', description: 'Управление ролями и доступом', to: '/admin/users' },
  { title: 'Услуги', description: 'Каталог услуг салона', to: '/admin/services' },
  { title: 'Записи', description: 'Контроль расписания и статусов', to: '/admin/bookings' },
  { title: 'Мастера', description: 'Команда и профили специалистов', to: '/masters' },
]

function AdminDashboard() {
  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">Администрирование</p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Админ-панель</h1>
      <p className="mt-3 max-w-2xl text-[var(--color-muted)]">Управляйте основными разделами Atelier Beauté в одном месте.</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {dashboardCards.map((card) => (
          <NavLink key={card.to} to={card.to} className="group rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70 transition hover:-translate-y-1 hover:ring-[var(--color-gold)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--color-plum)]">{card.title}</h2>
              <span className="text-2xl text-[var(--color-gold)] transition-transform group-hover:translate-x-1">→</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{card.description}</p>
          </NavLink>
        ))}
      </div>
    </section>
  )
}

export default AdminDashboard