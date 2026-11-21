import { useMemo, useState } from 'react'

function SortIcon({ direction }) {
  if (!direction) {
    return <span className="ml-1 text-[var(--color-sand)]">↕</span>
  }

  return <span className="ml-1 text-[var(--color-gold)]">{direction === 'asc' ? '↑' : '↓'}</span>
}

export default function AdminTable({
  columns,
  rows = [],
  rowKey = 'id',
  loading = false,
  emptyText = 'Записей пока нет',
  onRowClick,
  pageSize = 10,
  sort: externalSort,
  onSortChange,
  compact = false,
}) {
  const [internalSort, setInternalSort] = useState({ key: null, direction: 'asc' })
  const [page, setPage] = useState(1)

  const sort = externalSort || internalSort

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows

    const column = columns.find((item) => item.key === sort.key)
    if (!column) return rows

    const directionFactor = sort.direction === 'asc' ? 1 : -1

    return [...rows].sort((a, b) => {
      const getValue = column.sortValue || ((row) => row[sort.key])
      const first = getValue(a)
      const second = getValue(b)

      if (first === null || first === undefined) return 1
      if (second === null || second === undefined) return -1

      if (typeof first === 'number' && typeof second === 'number') {
        return (first - second) * directionFactor
      }

      if (typeof first === 'boolean' && typeof second === 'boolean') {
        return (Number(first) - Number(second)) * directionFactor
      }

      return String(first).localeCompare(String(second), 'ru') * directionFactor
    })
  }, [rows, columns, sort.key, sort.direction])

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const visibleRows = sortedRows.slice(start, start + pageSize)

  function handleSort(column) {
    if (!column.sortable) return

    const nextSort =
      sort.key === column.key
        ? { key: column.key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: 'asc' }

    if (onSortChange) {
      onSortChange(nextSort)
    } else {
      setInternalSort(nextSort)
    }

    setPage(1)
  }

  function handleRowClick(event, row) {
    if (!onRowClick) return
    if (event.target.closest('button, a, input, select, textarea, label')) return
    onRowClick(row)
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-[var(--color-white)] shadow-[0_14px_35px_rgba(74,48,71,0.08)] ring-1 ring-[var(--color-sand)]/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[var(--color-sand)] bg-[var(--color-ivory)]/70 text-xs tracking-[0.1em] text-[var(--color-muted)] uppercase">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${compact ? 'px-3 py-3' : 'px-5 py-4'} font-medium ${
                    column.className || ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className="flex items-center whitespace-nowrap transition hover:text-[var(--color-plum)]"
                    >
                      {column.label}
                      <SortIcon direction={sort.key === column.key ? sort.direction : null} />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-sand)]/60">
            {visibleRows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={(event) => handleRowClick(event, row)}
                className={`align-middle transition ${
                  onRowClick ? 'cursor-pointer hover:bg-[var(--color-ivory)]/80' : ''
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`${compact ? 'px-3 py-3' : 'px-5 py-4'} ${column.className || ''}`}
                  >
                    {column.render ? column.render(row) : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 border-t border-[var(--color-sand)]/60 px-5 py-10 text-sm text-[var(--color-muted)]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-sand)] border-t-[var(--color-plum)]" />
          Загрузка...
        </div>
      )}

      {!loading && visibleRows.length === 0 && (
        <div className="px-5 py-12 text-center text-sm text-[var(--color-muted)]">
          {emptyText}
        </div>
      )}

      {!loading && sortedRows.length > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-sand)]/60 px-5 py-4 text-xs text-[var(--color-muted)]">
          <span>
            Показано {start + 1}–{Math.min(start + pageSize, sortedRows.length)} из{' '}
            {sortedRows.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-[var(--color-sand)] px-3 py-2 text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Назад
            </button>
            <span className="px-2 text-[var(--color-plum)]">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage === pageCount}
              className="rounded-lg border border-[var(--color-sand)] px-3 py-2 text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Вперёд →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
