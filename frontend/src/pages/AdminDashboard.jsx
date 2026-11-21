import { NavLink } from 'react-router-dom'
const cards = [
  ['Пользователи', 'Роли, поиск и доступ', '/admin/users'],
  ['Категории', 'Категории услуг', '/admin/categories'],
  ['Услуги', 'Цена, длительность и буфер', '/admin/services'],
  ['Рабочие места', 'Столы и кресла', '/admin/workplaces'],
  ['Мастера', 'Профили и фотографии', '/admin/masters'],
  ['Расписания', 'Смены мастеров', '/admin/schedules'],
  ['Отсутствия', 'Отпуска и больничные', '/admin/absences'],
  ['Записи', 'Статусы и история', '/admin/bookings'],
]
export default function AdminDashboard() {
  return <section><p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">Администрирование</p><h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Админ-панель</h1><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([title, description, to]) => <NavLink key={to} to={to} className="rounded-2xl bg-white p-6 shadow ring-1 ring-[var(--color-sand)]/70 transition hover:-translate-y-1"><h2 className="text-xl font-semibold text-[var(--color-plum)]">{title}</h2><p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p></NavLink>)}</div></section>
}
