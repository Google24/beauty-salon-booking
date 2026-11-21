import { useState } from 'react'
import toast from 'react-hot-toast'
import AdminTable from '../../components/AdminTable'
import {
  Badge,
  BoolBadge,
  CheckboxField,
  ErrorPanel,
  Field,
  FilterPanel,
  PageHeader,
  SelectField,
  TableSection,
  inputClass,
} from '../../components/AdminUI'
import ConfirmDialog from '../../components/Modals/ConfirmDialog'
import Modal from '../../components/Modals/Modal'
import {
  createAbsence,
  createSchedule,
  deleteAbsence,
  deleteSchedule,
  getAbsences,
  getMasters,
  getSchedules,
  unwrapList,
  updateAbsence,
  updateSchedule,
} from '../../api/admin'
import { useAdminData } from '../../hooks/useAdminData'
import { ABSENCE_REASONS, WEEKDAYS, errorText, formatDate } from '../../utils/admin'

const CONFIG = {
  schedules: {
    title: 'Расписания',
    description: 'Смены мастеров по дням недели.',
    load: getSchedules,
    create: createSchedule,
    update: updateSchedule,
    remove: deleteSchedule,
  },
  absences: {
    title: 'Отсутствия',
    description: 'Отпуска, больничные и другие причины недоступности мастера.',
    load: getAbsences,
    create: createAbsence,
    update: updateAbsence,
    remove: deleteAbsence,
  },
}

const EMPTY_SCHEDULE = {
  master: '',
  weekday: '0',
  start_time: '09:00',
  end_time: '18:00',
  is_day_off: false,
}

const EMPTY_ABSENCE = {
  master: '',
  start_date: '',
  end_date: '',
  reason: 'vacation',
  comment: '',
}

export default function ScheduleAbsenceManager({ kind }) {
  const config = CONFIG[kind] || CONFIG.schedules
  const [masterFilter, setMasterFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(kind === 'schedules' ? EMPTY_SCHEDULE : EMPTY_ABSENCE)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, setData, loading, error, forbidden, reload } = useAdminData(
    () => config.load({ master: masterFilter }),
    [masterFilter, kind],
  )

  const { data: mastersData } = useAdminData(() => getMasters(), [])
  const masters = unwrapList(mastersData)
  const masterOptions = masters.map((master) => ({
    value: String(master.id),
    label: master.display_name,
  }))

  const items = unwrapList(data)

  function openCreate() {
    setEditing({ id: null })
    setForm(kind === 'schedules' ? EMPTY_SCHEDULE : EMPTY_ABSENCE)
  }

  function openEdit(item) {
    setEditing(item)

    if (kind === 'schedules') {
      setForm({
        master: String(item.master),
        weekday: String(item.weekday),
        start_time: item.start_time?.slice(0, 5) || '09:00',
        end_time: item.end_time?.slice(0, 5) || '18:00',
        is_day_off: Boolean(item.is_day_off),
      })
    } else {
      setForm({
        master: String(item.master),
        start_date: item.start_date,
        end_date: item.end_date,
        reason: item.reason,
        comment: item.comment || '',
      })
    }
  }

  function applySaved(saved, id) {
    setData((current) => {
      const list = unwrapList(current)

      return {
        ...(Array.isArray(current) ? {} : current),
        results: id
          ? list.map((item) => (item.id === id ? saved : item))
          : [saved, ...list],
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const payload =
        kind === 'schedules'
          ? {
              master: Number(form.master),
              weekday: Number(form.weekday),
              start_time: form.start_time,
              end_time: form.end_time,
              is_day_off: form.is_day_off,
            }
          : {
              master: Number(form.master),
              start_date: form.start_date,
              end_date: form.end_date,
              reason: form.reason,
              comment: form.comment,
            }

      const saved = editing.id
        ? await config.update(editing.id, payload)
        : await config.create(payload)

      applySaved(saved, editing.id)
      setEditing(null)
      toast.success(editing.id ? 'Изменения сохранены' : 'Запись добавлена')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось сохранить запись'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)

    try {
      await config.remove(deleting.id)
      setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== deleting.id),
      }))
      setDeleting(null)
      toast.success('Запись удалена')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось удалить запись'))
    } finally {
      setBusy(false)
    }
  }

  const columns =
    kind === 'schedules'
      ? [
          {
            key: 'master_name',
            label: 'Мастер',
            sortable: true,
            render: (row) => row.master_name || masters.find((m) => m.id === row.master)?.display_name || `Мастер #${row.master}`,
          },
          {
            key: 'weekday',
            label: 'День недели',
            sortable: true,
            render: (row) => row.weekday_name || WEEKDAYS[row.weekday]?.label || row.weekday,
          },
          { key: 'start_time', label: 'Начало', render: (row) => row.start_time?.slice(0, 5) },
          { key: 'end_time', label: 'Конец', render: (row) => row.end_time?.slice(0, 5) },
          { key: 'is_day_off', label: 'Выходной', render: (row) => <BoolBadge value={row.is_day_off} /> },
        ]
      : [
          {
            key: 'master',
            label: 'Мастер',
            sortable: true,
            render: (row) => masters.find((m) => m.id === row.master)?.display_name || `Мастер #${row.master}`,
          },
          {
            key: 'start_date',
            label: 'Дата начала',
            sortable: true,
            render: (row) => formatDate(row.start_date),
          },
          {
            key: 'end_date',
            label: 'Дата окончания',
            sortable: true,
            render: (row) => formatDate(row.end_date),
          },
          {
            key: 'reason',
            label: 'Причина',
            sortable: true,
            render: (row) => <Badge tone="gold">{row.reason_name || ABSENCE_REASONS[row.reason]}</Badge>,
          },
          { key: 'comment', label: 'Комментарий' },
        ]

  return (
    <section>
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-[var(--color-plum)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)]"
          >
            + Добавить
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
                Мастер
              </span>
              <select
                value={masterFilter}
                onChange={(event) => setMasterFilter(event.target.value)}
                className={inputClass}
              >
                <option value="">Все мастера</option>
                {masterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={reload}
                className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-4 py-2 text-sm text-[var(--color-plum)]"
              >
                Обновить
              </button>
            </div>
          </FilterPanel>

          <TableSection>
            <AdminTable
              columns={[
                ...columns,
                {
                  key: 'actions',
                  label: 'Действия',
                  render: (row) => (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded-lg border border-[var(--color-sand)] px-3 py-1.5 text-xs text-[var(--color-plum)]"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(row)}
                        className="rounded-lg border border-[#d6aeb3] px-3 py-1.5 text-xs text-[#8e3f4a]"
                      >
                        Удалить
                      </button>
                    </div>
                  ),
                },
              ]}
              rows={items}
              loading={loading}
              emptyText="Записей пока нет"
              pageSize={15}
            />
          </TableSection>

          {error && <ErrorPanel message={errorText(error, 'Не удалось загрузить данные')} />}
        </>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? 'Редактировать запись' : `Новая запись: ${config.title.toLowerCase()}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={saving}
              className="rounded-xl border border-[var(--color-sand)] px-4 py-2 text-sm text-[var(--color-plum)] disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              form="schedule-absence-form"
              disabled={saving}
              className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        }
      >
        <form id="schedule-absence-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Мастер"
            value={form.master}
            onChange={(event) => setForm({ ...form, master: event.target.value })}
            options={masterOptions}
            placeholder="Выберите мастера"
            className="sm:col-span-2"
          />

          {kind === 'schedules' ? (
            <>
              <SelectField
                label="День недели"
                value={form.weekday}
                onChange={(event) => setForm({ ...form, weekday: event.target.value })}
                options={WEEKDAYS.map((day) => ({ value: String(day.value), label: day.label }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Начало смены">
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>
                <Field label="Конец смены">
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(event) => setForm({ ...form, end_time: event.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <CheckboxField
                  label="Выходной день"
                  description="Мастер не принимает в этот день недели"
                  checked={form.is_day_off}
                  onChange={(event) => setForm({ ...form, is_day_off: event.target.checked })}
                />
              </div>
            </>
          ) : (
            <>
              <Field label="Дата начала">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                  className={inputClass}
                  required
                />
              </Field>
              <Field label="Дата окончания">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                  className={inputClass}
                  required
                />
              </Field>
              <SelectField
                label="Причина"
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
                options={Object.entries(ABSENCE_REASONS).map(([value, label]) => ({ value, label }))}
              />
              <Field label="Комментарий">
                <input
                  value={form.comment}
                  onChange={(event) => setForm({ ...form, comment: event.target.value })}
                  className={inputClass}
                />
              </Field>
            </>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Удаление записи"
        message="Удалить выбранную запись без возможности восстановления?"
        busy={busy}
      />
    </section>
  )
}
