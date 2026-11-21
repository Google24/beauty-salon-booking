import { useState } from 'react'
import toast from 'react-hot-toast'
import AdminTable from '../../components/AdminTable'
import {
  Badge,
  ErrorPanel,
  Field,
  FilterPanel,
  PageHeader,
  SelectField,
  StatusBadge,
  TableSection,
  Tabs,
  inputClass,
} from '../../components/AdminUI'
import Modal from '../../components/Modals/Modal'
import {
  cancelBooking,
  getBookingHistory,
  getBookings,
  getMasters,
  setAdminStatus,
  unwrapList,
} from '../../api/admin'
import { useAdminData, useDebouncedValue } from '../../hooks/useAdminData'
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  errorText,
  formatDateTime,
  formatMoney,
} from '../../utils/admin'

const EMPTY_STATUS_FORM = { status: '', comment: '' }

export default function AdminBookings() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [masterFilter, setMasterFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [detailId, setDetailId] = useState(null)
  const [tab, setTab] = useState('common')
  const [statusEditorOpen, setStatusEditorOpen] = useState(false)
  const [statusForm, setStatusForm] = useState(EMPTY_STATUS_FORM)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [busy, setBusy] = useState(false)

  const { data, setData, loading, error, forbidden, reload } = useAdminData(
    () =>
      getBookings({
        search: debouncedSearch,
        status: statusFilter,
        master: masterFilter,
        date_from: dateFrom,
        date_to: dateTo,
        ordering: '-start_at',
      }),
    [debouncedSearch, statusFilter, masterFilter, dateFrom, dateTo],
  )

  const { data: mastersData } = useAdminData(() => getMasters(), [])
  const masters = unwrapList(mastersData)
  const masterOptions = masters.map((master) => ({
    value: String(master.id),
    label: master.display_name,
  }))

  const bookings = unwrapList(data)
  const detail = bookings.find((booking) => booking.id === detailId) || null

  const historyState = useAdminData(
    () => (detailId ? getBookingHistory(detailId) : Promise.resolve([])),
    [detailId],
  )

  function replaceBooking(updated) {
    setData((current) => {
      const list = unwrapList(current)

      return {
        ...(Array.isArray(current) ? {} : current),
        results: list.map((booking) => (booking.id === updated.id ? { ...booking, ...updated } : booking)),
      }
    })
  }

  function openDetail(booking) {
    setDetailId(booking.id)
    setTab('common')
    setStatusEditorOpen(false)
    setStatusForm({ status: booking.status, comment: '' })
    setConfirmCancel(false)
  }

  function closeDetail() {
    if (busy) return
    setDetailId(null)
    setStatusEditorOpen(false)
    setConfirmCancel(false)
  }

  async function handleStatusChange(event) {
    event.preventDefault()
    if (!detail) return
    setBusy(true)

    try {
      const updated = await setAdminStatus(detail.id, statusForm.status, statusForm.comment)

      replaceBooking(updated)
      historyState.reload()
      setStatusEditorOpen(false)
      setStatusForm({ status: updated.status, comment: '' })
      toast.success('Статус изменён администратором')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось изменить статус'))
    } finally {
      setBusy(false)
    }
  }

  async function handleCancel() {
    if (!detail) return
    setBusy(true)

    try {
      const updated = await cancelBooking(detail.id)

      replaceBooking(updated)
      historyState.reload()
      setConfirmCancel(false)
      toast.success('Запись отменена')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось отменить запись'))
    } finally {
      setBusy(false)
    }
  }

  const columns = [
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
    {
      key: 'end_at',
      label: 'Окончание',
      sortable: true,
      render: (row) => formatDateTime(row.end_at),
    },
    {
      key: 'client',
      label: 'Клиент',
      sortable: true,
      sortValue: (row) => row.client_name || row.client_email || '',
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-plum)]">{row.client_name || '—'}</p>
          <p className="text-xs text-[var(--color-muted)]">{row.client_email}</p>
        </div>
      ),
    },
    {
      key: 'master',
      label: 'Мастер',
      sortable: true,
      sortValue: (row) => row.master_name || '',
      render: (row) => row.master_name || `Мастер #${row.master}`,
    },
    {
      key: 'workplace',
      label: 'Место',
      sortable: true,
      sortValue: (row) => row.workplace_name || '',
      render: (row) => row.workplace_name || '—',
    },
    {
      key: 'status',
      label: 'Статус',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'total_price',
      label: 'Цена',
      sortable: true,
      sortValue: (row) => Number(row.total_price),
      render: (row) => formatMoney(row.total_price),
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

  const history = unwrapList(historyState.data)

  return (
    <section>
      <PageHeader
        title="Записи"
        description="Статусы и история. Для админки используется принудительная смена статуса через admin-status."
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
            <label>
              <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
                Поиск
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Клиент, мастер, место"
                className={inputClass}
              />
            </label>
            <SelectField
              label="Статус"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={STATUS_OPTIONS}
              placeholder="Все статусы"
            />
            <SelectField
              label="Мастер"
              value={masterFilter}
              onChange={(event) => setMasterFilter(event.target.value)}
              options={masterOptions}
              placeholder="Все мастера"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Дата с">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className={`${inputClass} min-h-10 py-2 text-xs`}
                />
              </Field>
              <Field label="Дата по">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className={`${inputClass} min-h-10 py-2 text-xs`}
                />
              </Field>
            </div>
          </FilterPanel>

          <TableSection>
            <AdminTable
              columns={columns}
              rows={bookings}
              loading={loading}
              emptyText="Записи не найдены"
              onRowClick={openDetail}
              pageSize={15}
            />
          </TableSection>

          {error && <ErrorPanel message={errorText(error, 'Не удалось загрузить записи')} />}
        </>
      )}

      <Modal
        open={Boolean(detail)}
        onClose={closeDetail}
        title={`Запись #${detail?.id || ''}`}
        subtitle={detail ? `${formatDateTime(detail.start_at)} — ${formatDateTime(detail.end_at)}` : ''}
        size="xl"
        footer={
          <>
            {confirmCancel ? (
              <div className="mr-auto flex flex-wrap items-center gap-3">
                <span className="text-sm text-[#8e3f4a]">Отменить эту запись?</span>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={busy}
                  className="rounded-xl bg-[#8e3f4a] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {busy ? 'Выполнение...' : 'Да, отменить'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  disabled={busy}
                  className="rounded-xl border border-[var(--color-sand)] px-4 py-2 text-sm text-[var(--color-plum)]"
                >
                  Нет
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                disabled={busy || detail?.status === 'cancelled'}
                className="mr-auto rounded-xl border border-[#d6aeb3] px-4 py-2 text-sm font-medium text-[#8e3f4a] transition hover:bg-[#fbecee] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Отменить запись
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStatusEditorOpen((value) => !value)
                setStatusForm({ status: detail?.status || '', comment: '' })
              }}
              disabled={busy}
              className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)] disabled:opacity-50"
            >
              {statusEditorOpen ? 'Скрыть форму' : 'Изменить статус'}
            </button>
            <button
              type="button"
              onClick={closeDetail}
              disabled={busy}
              className="rounded-xl border border-[var(--color-sand)] px-4 py-2 text-sm text-[var(--color-plum)]"
            >
              Закрыть
            </button>
          </>
        }
      >
        {detail && (
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={detail.status} />
              <Badge tone="neutral">{formatMoney(detail.total_price)}</Badge>
            </div>

            {statusEditorOpen && (
              <form
                onSubmit={handleStatusChange}
                className="mt-5 rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)]/70 p-4"
              >
                <div className="flex items-start gap-2">
                  <span className="rounded-full bg-[#faf3e4] px-2.5 py-1 text-xs font-medium text-[#8a6d34]">
                    Admin-status
                  </span>
                  <p className="text-xs leading-5 text-[var(--color-muted)]">
                    Администратор может поставить любой статус, включая «нелогичные» переходы
                    (например, done → new). Обычный эндпоинт /status/ здесь не используется.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <SelectField
                    label="Новый статус"
                    value={statusForm.status}
                    onChange={(event) =>
                      setStatusForm((current) => ({ ...current, status: event.target.value }))
                    }
                    options={STATUS_OPTIONS}
                    placeholder="Выберите статус"
                  />
                  <Field label="Комментарий">
                    <input
                      value={statusForm.comment}
                      onChange={(event) =>
                        setStatusForm((current) => ({ ...current, comment: event.target.value }))
                      }
                      placeholder="Причина изменения (необязательно)"
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={busy || !statusForm.status || statusForm.status === detail.status}
                    className="rounded-xl bg-[var(--color-plum)] px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? 'Сохранение...' : 'Применить статус'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5">
              <Tabs
                active={tab}
                onChange={setTab}
                tabs={[
                  { key: 'common', label: 'Общее' },
                  { key: 'services', label: 'Услуги', count: detail.services?.length || 0 },
                  { key: 'history', label: 'История', count: history.length },
                ]}
              />
            </div>

            {tab === 'common' && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-[var(--color-ivory)] p-4">
                  <p className="text-xs text-[var(--color-muted)] uppercase">Клиент</p>
                  <p className="mt-1 font-medium text-[var(--color-plum)]">
                    {detail.client_name || '—'}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">{detail.client_email}</p>
                  <p className="text-sm text-[var(--color-muted)]">{detail.client_phone || '—'}</p>
                </div>
                <div className="rounded-xl bg-[var(--color-ivory)] p-4">
                  <p className="text-xs text-[var(--color-muted)] uppercase">Исполнитель</p>
                  <p className="mt-1 font-medium text-[var(--color-plum)]">
                    {detail.master_name || `Мастер #${detail.master}`}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {detail.workplace_name || `Место #${detail.workplace}`}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--color-ivory)] p-4">
                  <p className="text-xs text-[var(--color-muted)] uppercase">Время</p>
                  <p className="mt-1 text-sm text-[var(--color-plum)]">
                    Начало: {formatDateTime(detail.start_at)}
                  </p>
                  <p className="text-sm text-[var(--color-plum)]">
                    Окончание: {formatDateTime(detail.end_at)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    Создана: {formatDateTime(detail.created_at)}
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--color-ivory)] p-4">
                  <p className="text-xs text-[var(--color-muted)] uppercase">Комментарий клиента</p>
                  <p className="mt-1 text-sm text-[var(--color-ink)]">
                    {detail.comment || '—'}
                  </p>
                </div>
              </div>
            )}

            {tab === 'services' && (
              <div className="mt-5">
                <AdminTable
                  compact
                  rows={detail.services || []}
                  pageSize={10}
                  emptyText="Услуги в записи не найдены"
                  columns={[
                    {
                      key: 'service_name',
                      label: 'Услуга',
                      render: (row) => <span className="font-medium">{row.service_name}</span>,
                    },
                    { key: 'price', label: 'Цена', render: (row) => formatMoney(row.price) },
                    {
                      key: 'duration_min',
                      label: 'Длительность',
                      render: (row) => `${row.duration_min} мин.`,
                    },
                  ]}
                />
              </div>
            )}

            {tab === 'history' && (
              <div className="mt-5">
                {historyState.loading && (
                  <p className="py-6 text-center text-sm text-[var(--color-muted)]">
                    Загрузка истории...
                  </p>
                )}
                {!historyState.loading && (
                  <AdminTable
                    compact
                    rows={history}
                    pageSize={10}
                    emptyText="История изменений пока пуста"
                    columns={[
                      {
                        key: 'from_status',
                        label: 'Было',
                        render: (row) =>
                          row.from_status ? (
                            STATUS_LABELS[row.from_status] || row.from_status
                          ) : (
                            <span className="text-[var(--color-muted)]">—</span>
                          ),
                      },
                      {
                        key: 'to_status',
                        label: 'Стало',
                        render: (row) => (
                          <StatusBadge status={row.to_status} />
                        ),
                      },
                      {
                        key: 'changed_by_email',
                        label: 'Кто изменил',
                        render: (row) => row.changed_by_email || '#',
                      },
                      {
                        key: 'changed_at',
                        label: 'Дата',
                        render: (row) => formatDateTime(row.changed_at),
                      },
                      {
                        key: 'comment',
                        label: 'Комментарий',
                        render: (row) => row.comment || '—',
                      },
                    ]}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  )
}
