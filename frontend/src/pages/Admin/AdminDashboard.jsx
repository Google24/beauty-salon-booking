import { useState } from 'react'
import { Link } from 'react-router-dom'
import AdminTable from '../../components/AdminTable'
import { Badge, PageHeader, StatusBadge } from '../../components/AdminUI'
import {
  getBookings,
  getMasters,
  getServices,
  getUsers,
  unwrapList,
} from '../../api/admin'
import { useAdminData } from '../../hooks/useAdminData'
import { errorText, formatDateTime } from '../../utils/admin'

const SECTIONS = [
  { title: 'Пользователи', description: 'Роли, поиск и доступ', to: '/admin/users', icon: '◉' },
  { title: 'Категории', description: 'Категории услуг', to: '/admin/categories', icon: '▦' },
  { title: 'Услуги', description: 'Цена, длительность и буфер', to: '/admin/services', icon: '✂' },
  { title: 'Рабочие места', description: 'Столы и кресла', to: '/admin/workplaces', icon: '▣' },
  { title: 'Мастера', description: 'Профили и фотографии', to: '/admin/masters', icon: '☺' },
  { title: 'Расписания', description: 'Смены мастеров', to: '/admin/schedules', icon: '◷' },
  { title: 'Отсутствия', description: 'Отпуска и больничные', to: '/admin/absences', icon: '◌' },
  { title: 'Записи', description: 'Статусы и история', to: '/admin/bookings', icon: '▤' },
  { title: 'Отзывы', description: 'Оценки клиентов', to: '/admin/reviews', icon: '★' },
]

export default function AdminDashboard() {
  const [today] = useState(() => new Date().toLocaleDateString('sv-SE'))

  const { data, loading, error } = useAdminData(async () => {
    const [users, services, masters, todayBookings] = await Promise.all([
      getUsers(),
      getServices(),
      getMasters(),
      getBookings({ date: today }),
    ])

    return {
      users: unwrapList(users).length,
      services: unwrapList(services).length,
      masters: unwrapList(masters).length,
      todayBookings: unwrapList(todayBookings),
    }
  }, [])

  const recentColumns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (row) => <span className="font-medium text-[var(--color-plum)]">#{row.id}</span>,
    },
    {
      key: 'start_at',
      label: 'Начало',
      sortable: true,
      render: (row) => formatDateTime(row.start_at),
    },
    { key: 'client', label: 'Клиент', render: (row) => row.client_name || '—' },
    { key: 'master', label: 'Мастер', render: (row) => row.master_name || '—' },
    { key: 'status', label: 'Статус', render: (row) => <StatusBadge status={row.status} /> },
  ]

  return (
    <section>
      <PageHeader
        title="Админ-панель"
        description="Управление салоном: пользователи, каталог, мастера, расписание и записи."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-[var(--color-plum)] p-5 text-white shadow-lg">
          <p className="text-xs tracking-[0.12em] uppercase opacity-75">Записей сегодня</p>
          <p className="mt-3 text-4xl font-semibold">{loading ? '—' : data?.todayBookings.length ?? 0}</p>
          <Link to="/admin/bookings" className="mt-3 inline-block text-xs underline underline-offset-4">
            Открыть записи →
          </Link>
        </div>
        <div className="rounded-2xl bg-[var(--color-white)] p-5 shadow ring-1 ring-[var(--color-sand)]">
          <p className="text-xs tracking-[0.12em] text-[var(--color-muted)] uppercase">Пользователи</p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-plum-deep)]">
            {loading ? '—' : data?.users ?? 0}
          </p>
          <Link to="/admin/users" className="mt-3 inline-block text-xs text-[var(--color-plum)] underline underline-offset-4">
            Управлять →
          </Link>
        </div>
        <div className="rounded-2xl bg-[var(--color-white)] p-5 shadow ring-1 ring-[var(--color-sand)]">
          <p className="text-xs tracking-[0.12em] text-[var(--color-muted)] uppercase">Услуги</p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-plum-deep)]">
            {loading ? '—' : data?.services ?? 0}
          </p>
          <Link to="/admin/services" className="mt-3 inline-block text-xs text-[var(--color-plum)] underline underline-offset-4">
            Каталог →
          </Link>
        </div>
        <div className="rounded-2xl bg-[var(--color-white)] p-5 shadow ring-1 ring-[var(--color-sand)]">
          <p className="text-xs tracking-[0.12em] text-[var(--color-muted)] uppercase">Мастера</p>
          <p className="mt-3 text-4xl font-semibold text-[var(--color-plum-deep)]">
            {loading ? '—' : data?.masters ?? 0}
          </p>
          <Link to="/admin/masters" className="mt-3 inline-block text-xs text-[var(--color-plum)] underline underline-offset-4">
            Команда →
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="group rounded-2xl bg-[var(--color-white)] p-5 shadow ring-1 ring-[var(--color-sand)]/80 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-ivory)] text-lg text-[var(--color-plum)] ring-1 ring-[var(--color-sand)]">
                {section.icon}
              </span>
              <h2 className="text-lg font-semibold text-[var(--color-plum-deep)]">
                {section.title}
              </h2>
            </div>
            <p className="mt-3 text-sm text-[var(--color-muted)]">{section.description}</p>
            <p className="mt-4 text-xs text-[var(--color-gold)] opacity-0 transition group-hover:opacity-100">
              Перейти →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-plum-deep)]">
            Записи на сегодня
          </h2>
          <Badge tone="gold">{today}</Badge>
        </div>
        {error && (
          <div className="rounded-2xl bg-[#fbecee] px-5 py-4 text-sm text-[#8e3f4a]">
            {errorText(error, 'Не удалось загрузить сводку')}
          </div>
        )}
        {!error && (
          <AdminTable
            columns={recentColumns}
            rows={data?.todayBookings || []}
            loading={loading}
            pageSize={8}
            emptyText="На сегодня записей нет"
          />
        )}
      </div>
    </section>
  )
}
