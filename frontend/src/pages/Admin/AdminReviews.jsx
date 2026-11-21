import { useState } from 'react'
import AdminTable from '../../components/AdminTable'
import {
  Badge,
  ErrorPanel,
  FilterPanel,
  PageHeader,
  StatusBadge,
  TableSection,
  inputClass,
} from '../../components/AdminUI'
import Modal from '../../components/Modals/Modal'
import { getReviews, unwrapList } from '../../api/admin'
import { useAdminData, useDebouncedValue } from '../../hooks/useAdminData'
import { errorText, formatDateTime } from '../../utils/admin'

function Stars({ rating }) {
  return (
    <span className="whitespace-nowrap text-[var(--color-gold)]" aria-label={`Оценка ${rating} из 5`}>
      {'★'.repeat(rating)}
      <span className="text-[var(--color-sand)]">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function AdminReviews() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [ratingFilter, setRatingFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const { data, loading, error, forbidden, reload } = useAdminData(
    () => getReviews({ search: debouncedSearch, rating: ratingFilter }),
    [debouncedSearch, ratingFilter],
  )

  const reviews = unwrapList(data)

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (row) => <span className="text-xs text-[var(--color-muted)]">#{row.id}</span>,
    },
    {
      key: 'booking',
      label: 'Запись',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-plum)]">#{row.booking}</p>
          <p className="text-xs text-[var(--color-muted)]">{formatDateTime(row.booking_start_at)}</p>
        </div>
      ),
    },
    {
      key: 'client_name',
      label: 'Клиент',
      sortable: true,
      render: (row) => row.client_name || row.client_email || '—',
    },
    { key: 'master_name', label: 'Мастер', sortable: true },
    {
      key: 'rating',
      label: 'Оценка',
      sortable: true,
      render: (row) => <Stars rating={row.rating} />,
    },
    {
      key: 'text',
      label: 'Текст',
      render: (row) => (
        <span className="block max-w-xs truncate text-sm text-[var(--color-muted)]">
          {row.text || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Дата',
      sortable: true,
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: 'actions',
      label: '',
      render: () => (
        <button
          type="button"
          className="rounded-lg border border-[var(--color-sand)] px-3 py-1.5 text-xs text-[var(--color-plum)]"
        >
          Открыть
        </button>
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        title="Отзывы"
        description="Только просмотр: отзывы создаются клиентами через API."
        actions={
          <button
            type="button"
            onClick={reload}
            className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-4 py-2 text-sm text-[var(--color-plum)]"
          >
            Обновить
          </button>
        }
      />

      {forbidden ? (
        <ErrorPanel message="Доступ запрещён" />
      ) : (
        <>
          <FilterPanel>
            <label className="lg:col-span-2">
              <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
                Поиск
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Клиент, мастер или текст отзыва"
                className={inputClass}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
                Оценка
              </span>
              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                className={inputClass}
              >
                <option value="">Любая</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} ★
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <Badge tone="plum">Всего: {reviews.length}</Badge>
            </div>
          </FilterPanel>

          <TableSection>
            <AdminTable
              columns={columns}
              rows={reviews}
              loading={loading}
              emptyText="Отзывов пока нет"
              onRowClick={setSelected}
              pageSize={15}
            />
          </TableSection>

          {error && <ErrorPanel message={errorText(error, 'Не удалось загрузить отзывы')} />}
        </>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Отзыв #${selected?.id || ''}`}
        subtitle={selected ? formatDateTime(selected.created_at) : ''}
        size="md"
        footer={
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="rounded-xl border border-[var(--color-sand)] px-4 py-2 text-sm text-[var(--color-plum)]"
          >
            Закрыть
          </button>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Stars rating={selected.rating} />
              <StatusBadge status={selected.booking_status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--color-ivory)] p-4">
                <p className="text-xs text-[var(--color-muted)] uppercase">Клиент</p>
                <p className="mt-1 font-medium text-[var(--color-plum)]">
                  {selected.client_name || '—'}
                </p>
                <p className="text-sm text-[var(--color-muted)]">{selected.client_email}</p>
              </div>
              <div className="rounded-xl bg-[var(--color-ivory)] p-4">
                <p className="text-xs text-[var(--color-muted)] uppercase">Мастер и запись</p>
                <p className="mt-1 font-medium text-[var(--color-plum)]">{selected.master_name}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  Запись #{selected.booking} · {formatDateTime(selected.booking_start_at)}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--color-sand)] p-4">
              <p className="text-xs text-[var(--color-muted)] uppercase">Текст отзыва</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6">
                {selected.text || 'Клиент не оставил текст.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
