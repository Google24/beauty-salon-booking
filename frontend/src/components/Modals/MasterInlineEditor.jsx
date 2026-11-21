import { useState } from 'react'
import toast from 'react-hot-toast'
import AdminTable from '../AdminTable'
import {
  Badge,
  BoolBadge,
  CheckboxField,
  Field,
  SelectField,
  Tabs,
  inputClass,
} from '../AdminUI'
import {
  createAbsence,
  createMasterService,
  createSchedule,
  deleteAbsence,
  deleteMasterService,
  deleteSchedule,
  getAbsences,
  getMasterServices,
  getSchedules,
  getServices,
  unwrapList,
  updateAbsence,
  updateMasterService,
  updateSchedule,
} from '../../api/admin'
import { useAdminData } from '../../hooks/useAdminData'
import {
  ABSENCE_REASONS,
  WEEKDAYS,
  errorText,
  formatDate,
  formatMoney,
} from '../../utils/admin'

const EMPTY_SERVICE = { service: '', price_override: '', duration_override: '' }
const EMPTY_SCHEDULE = { weekday: '0', start_time: '09:00', end_time: '18:00', is_day_off: false }
const EMPTY_ABSENCE = { start_date: '', end_date: '', reason: 'vacation', comment: '' }

export default function MasterInlineEditor({ master, onClose }) {
  const [tab, setTab] = useState('services')

  const servicesState = useAdminData(() => getMasterServices({ master: master.id }), [master.id])
  const schedulesState = useAdminData(() => getSchedules({ master: master.id }), [master.id])
  const absencesState = useAdminData(() => getAbsences({ master: master.id }), [master.id])
  const catalogState = useAdminData(() => getServices(), [])

  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE)
  const [editingService, setEditingService] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [absenceForm, setAbsenceForm] = useState(EMPTY_ABSENCE)
  const [editingAbsence, setEditingAbsence] = useState(null)
  const [busy, setBusy] = useState(false)

  const masterServices = unwrapList(servicesState.data)
  const schedules = unwrapList(schedulesState.data)
  const absences = unwrapList(absencesState.data)
  const catalogServices = unwrapList(catalogState.data)

  async function saveService(event) {
    event.preventDefault()
    setBusy(true)

    try {
      const payload = {
        master: master.id,
        service: Number(serviceForm.service),
        price_override: serviceForm.price_override === '' ? null : Number(serviceForm.price_override),
        duration_override:
          serviceForm.duration_override === '' ? null : Number(serviceForm.duration_override),
      }

      const saved = editingService
        ? await updateMasterService(editingService.id, payload)
        : await createMasterService(payload)

      servicesState.setData((current) => {
        const list = unwrapList(current)

        return {
          ...(Array.isArray(current) ? {} : current),
          results: editingService
            ? list.map((item) => (item.id === editingService.id ? saved : item))
            : [saved, ...list],
        }
      })

      setServiceForm(EMPTY_SERVICE)
      setEditingService(null)
      toast.success(editingService ? 'Услуга мастера обновлена' : 'Услуга добавлена мастеру')
    } catch (error) {
      toast.error(errorText(error, 'Не удалось сохранить услугу мастера'))
    } finally {
      setBusy(false)
    }
  }

  async function removeService(row) {
    setBusy(true)

    try {
      await deleteMasterService(row.id)
      servicesState.setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== row.id),
      }))
      toast.success('Услуга убрана у мастера')
    } catch (error) {
      toast.error(errorText(error, 'Не удалось удалить услугу мастера'))
    } finally {
      setBusy(false)
    }
  }

  async function saveSchedule(event) {
    event.preventDefault()
    setBusy(true)

    try {
      const payload = {
        master: master.id,
        weekday: Number(scheduleForm.weekday),
        start_time: scheduleForm.start_time,
        end_time: scheduleForm.end_time,
        is_day_off: scheduleForm.is_day_off,
      }

      const saved = editingSchedule
        ? await updateSchedule(editingSchedule.id, payload)
        : await createSchedule(payload)

      schedulesState.setData((current) => {
        const list = unwrapList(current)

        return {
          ...(Array.isArray(current) ? {} : current),
          results: editingSchedule
            ? list.map((item) => (item.id === editingSchedule.id ? saved : item))
            : [saved, ...list],
        }
      })

      setScheduleForm(EMPTY_SCHEDULE)
      setEditingSchedule(null)
      toast.success(editingSchedule ? 'Смена обновлена' : 'Смена добавлена')
    } catch (error) {
      toast.error(errorText(error, 'Не удалось сохранить расписание'))
    } finally {
      setBusy(false)
    }
  }

  async function removeSchedule(row) {
    setBusy(true)

    try {
      await deleteSchedule(row.id)
      schedulesState.setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== row.id),
      }))
      toast.success('Смена удалена')
    } catch (error) {
      toast.error(errorText(error, 'Не удалось удалить смену'))
    } finally {
      setBusy(false)
    }
  }

  async function saveAbsence(event) {
    event.preventDefault()
    setBusy(true)

    try {
      const payload = {
        master: master.id,
        start_date: absenceForm.start_date,
        end_date: absenceForm.end_date,
        reason: absenceForm.reason,
        comment: absenceForm.comment,
      }

      const saved = editingAbsence
        ? await updateAbsence(editingAbsence.id, payload)
        : await createAbsence(payload)

      absencesState.setData((current) => {
        const list = unwrapList(current)

        return {
          ...(Array.isArray(current) ? {} : current),
          results: editingAbsence
            ? list.map((item) => (item.id === editingAbsence.id ? saved : item))
            : [saved, ...list],
        }
      })

      setAbsenceForm(EMPTY_ABSENCE)
      setEditingAbsence(null)
      toast.success(editingAbsence ? 'Отсутствие обновлено' : 'Отсутствие добавлено')
    } catch (error) {
      toast.error(errorText(error, 'Не удалось сохранить отсутствие'))
    } finally {
      setBusy(false)
    }
  }

  async function removeAbsence(row) {
    setBusy(true)

    try {
      await deleteAbsence(row.id)
      absencesState.setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== row.id),
      }))
      toast.success('Отсутствие удалено')
    } catch (error) {
      toast.error(errorText(error, 'Не удалось удалить отсутствие'))
    } finally {
      setBusy(false)
    }
  }

  const tabs = [
    { key: 'services', label: 'Услуги', count: masterServices.length },
    { key: 'schedules', label: 'Расписание', count: schedules.length },
    { key: 'absences', label: 'Отсутствия', count: absences.length },
  ]

  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'services' && (
        <div className="mt-5 space-y-5">
          <form onSubmit={saveService} className="grid gap-3 rounded-xl bg-[var(--color-ivory)] p-4 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <label className="text-xs font-medium text-[var(--color-plum)]">
              Услуга
              <select
                value={serviceForm.service}
                onChange={(event) => setServiceForm({ ...serviceForm, service: event.target.value })}
                className={`${inputClass} mt-1 min-h-10 text-xs`}
                required
              >
                <option value="">Выберите услугу</option>
                {catalogServices
                  .filter((item) => item.is_active)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {formatMoney(item.price)} / {item.duration_min} мин.
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-xs font-medium text-[var(--color-plum)]">
              Своя цена
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="по умолчанию"
                value={serviceForm.price_override}
                onChange={(event) =>
                  setServiceForm({ ...serviceForm, price_override: event.target.value })
                }
                className={`${inputClass} mt-1 min-h-10 text-xs`}
              />
            </label>
            <label className="text-xs font-medium text-[var(--color-plum)]">
              Своя длительность
              <input
                type="number"
                min="1"
                placeholder="по умолчанию"
                value={serviceForm.duration_override}
                onChange={(event) =>
                  setServiceForm({ ...serviceForm, duration_override: event.target.value })
                }
                className={`${inputClass} mt-1 min-h-10 text-xs`}
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={busy}
                className="h-10 rounded-xl bg-[var(--color-plum)] px-4 text-xs font-medium text-white disabled:opacity-50"
              >
                {editingService ? 'Обновить' : '+ Добавить'}
              </button>
              {editingService && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(null)
                    setServiceForm(EMPTY_SERVICE)
                  }}
                  className="h-10 rounded-xl border border-[var(--color-sand)] px-3 text-xs text-[var(--color-muted)]"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          <AdminTable
            compact
            pageSize={10}
            loading={servicesState.loading}
            rows={masterServices}
            emptyText="Мастер пока не выполняет услуги"
            columns={[
              {
                key: 'service_name',
                label: 'Услуга',
                render: (row) => <span className="font-medium">{row.service_name}</span>,
              },
              {
                key: 'price',
                label: 'Цена',
                render: (row) => formatMoney(row.price_override ?? row.price),
              },
              {
                key: 'duration',
                label: 'Длительность',
                render: (row) => `${row.duration_override ?? row.duration_min} мин.`,
              },
              {
                key: 'actions',
                label: '',
                render: (row) => (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(row)
                        setServiceForm({
                          service: String(row.service),
                          price_override: row.price_override ?? '',
                          duration_override: row.duration_override ?? '',
                        })
                      }}
                      className="rounded-lg border border-[var(--color-sand)] px-2 py-1 text-xs text-[var(--color-plum)]"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => removeService(row)}
                      className="rounded-lg border border-[#d6aeb3] px-2 py-1 text-xs text-[#8e3f4a]"
                    >
                      Удалить
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {tab === 'schedules' && (
        <div className="mt-5 space-y-5">
          <form onSubmit={saveSchedule} className="grid gap-3 rounded-xl bg-[var(--color-ivory)] p-4 sm:grid-cols-5">
            <SelectField
              label="День недели"
              value={scheduleForm.weekday}
              onChange={(event) => setScheduleForm({ ...scheduleForm, weekday: event.target.value })}
              options={WEEKDAYS.map((day) => ({ value: String(day.value), label: day.label }))}
            />
            <Field label="Начало">
              <input
                type="time"
                value={scheduleForm.start_time}
                onChange={(event) => setScheduleForm({ ...scheduleForm, start_time: event.target.value })}
                className={`${inputClass} min-h-10 text-xs`}
                required
              />
            </Field>
            <Field label="Конец">
              <input
                type="time"
                value={scheduleForm.end_time}
                onChange={(event) => setScheduleForm({ ...scheduleForm, end_time: event.target.value })}
                className={`${inputClass} min-h-10 text-xs`}
                required
              />
            </Field>
            <div className="flex items-end">
              <CheckboxField
                label="Выходной"
                checked={scheduleForm.is_day_off}
                onChange={(event) =>
                  setScheduleForm({ ...scheduleForm, is_day_off: event.target.checked })
                }
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={busy}
                className="h-10 rounded-xl bg-[var(--color-plum)] px-4 text-xs font-medium text-white disabled:opacity-50"
              >
                {editingSchedule ? 'Обновить' : '+ Добавить'}
              </button>
              {editingSchedule && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSchedule(null)
                    setScheduleForm(EMPTY_SCHEDULE)
                  }}
                  className="h-10 rounded-xl border border-[var(--color-sand)] px-3 text-xs text-[var(--color-muted)]"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          <AdminTable
            compact
            pageSize={10}
            loading={schedulesState.loading}
            rows={schedules}
            emptyText="Расписание ещё не задано"
            columns={[
              {
                key: 'weekday',
                label: 'День',
                sortable: true,
                render: (row) => row.weekday_name || WEEKDAYS[row.weekday]?.label || row.weekday,
              },
              { key: 'start_time', label: 'Начало', render: (row) => row.start_time?.slice(0, 5) },
              { key: 'end_time', label: 'Конец', render: (row) => row.end_time?.slice(0, 5) },
              { key: 'is_day_off', label: 'Выходной', render: (row) => <BoolBadge value={row.is_day_off} /> },
              {
                key: 'actions',
                label: '',
                render: (row) => (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSchedule(row)
                        setScheduleForm({
                          weekday: String(row.weekday),
                          start_time: row.start_time?.slice(0, 5) || '09:00',
                          end_time: row.end_time?.slice(0, 5) || '18:00',
                          is_day_off: Boolean(row.is_day_off),
                        })
                      }}
                      className="rounded-lg border border-[var(--color-sand)] px-2 py-1 text-xs text-[var(--color-plum)]"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSchedule(row)}
                      className="rounded-lg border border-[#d6aeb3] px-2 py-1 text-xs text-[#8e3f4a]"
                    >
                      Удалить
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {tab === 'absences' && (
        <div className="mt-5 space-y-5">
          <form onSubmit={saveAbsence} className="grid gap-3 rounded-xl bg-[var(--color-ivory)] p-4 sm:grid-cols-5">
            <Field label="Начало">
              <input
                type="date"
                value={absenceForm.start_date}
                onChange={(event) => setAbsenceForm({ ...absenceForm, start_date: event.target.value })}
                className={`${inputClass} min-h-10 text-xs`}
                required
              />
            </Field>
            <Field label="Окончание">
              <input
                type="date"
                value={absenceForm.end_date}
                onChange={(event) => setAbsenceForm({ ...absenceForm, end_date: event.target.value })}
                className={`${inputClass} min-h-10 text-xs`}
                required
              />
            </Field>
            <SelectField
              label="Причина"
              value={absenceForm.reason}
              onChange={(event) => setAbsenceForm({ ...absenceForm, reason: event.target.value })}
              options={Object.entries(ABSENCE_REASONS).map(([value, label]) => ({ value, label }))}
            />
            <Field label="Комментарий">
              <input
                value={absenceForm.comment}
                onChange={(event) => setAbsenceForm({ ...absenceForm, comment: event.target.value })}
                className={`${inputClass} min-h-10 text-xs`}
              />
            </Field>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={busy}
                className="h-10 rounded-xl bg-[var(--color-plum)] px-4 text-xs font-medium text-white disabled:opacity-50"
              >
                {editingAbsence ? 'Обновить' : '+ Добавить'}
              </button>
              {editingAbsence && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAbsence(null)
                    setAbsenceForm(EMPTY_ABSENCE)
                  }}
                  className="h-10 rounded-xl border border-[var(--color-sand)] px-3 text-xs text-[var(--color-muted)]"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          <AdminTable
            compact
            pageSize={10}
            loading={absencesState.loading}
            rows={absences}
            emptyText="Отсутствий нет"
            columns={[
              {
                key: 'start_date',
                label: 'С',
                sortable: true,
                render: (row) => formatDate(row.start_date),
              },
              {
                key: 'end_date',
                label: 'По',
                sortable: true,
                render: (row) => formatDate(row.end_date),
              },
              {
                key: 'reason',
                label: 'Причина',
                render: (row) => <Badge tone="gold">{row.reason_name || ABSENCE_REASONS[row.reason]}</Badge>,
              },
              { key: 'comment', label: 'Комментарий' },
              {
                key: 'actions',
                label: '',
                render: (row) => (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAbsence(row)
                        setAbsenceForm({
                          start_date: row.start_date,
                          end_date: row.end_date,
                          reason: row.reason,
                          comment: row.comment || '',
                        })
                      }}
                      className="rounded-lg border border-[var(--color-sand)] px-2 py-1 text-xs text-[var(--color-plum)]"
                    >
                      Изменить
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAbsence(row)}
                      className="rounded-lg border border-[#d6aeb3] px-2 py-1 text-xs text-[#8e3f4a]"
                    >
                      Удалить
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[var(--color-sand)] px-4 py-2 text-sm text-[var(--color-plum)]"
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
