import { useState } from 'react'
import toast from 'react-hot-toast'
import AdminTable from '../../components/AdminTable'
import {
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
  createWorkplace,
  deleteWorkplace,
  getWorkplaces,
  unwrapList,
  updateWorkplace,
} from '../../api/admin'
import { useAdminData, useDebouncedValue } from '../../hooks/useAdminData'
import { errorText } from '../../utils/admin'

const EMPTY_FORM = {
  name: '',
  workplace_type: 'manicure_table',
  is_active: true,
}

const TYPE_OPTIONS = [
  { value: 'manicure_table', label: 'Маникюрный стол' },
  { value: 'pedicure_chair', label: 'Педикюрное кресло' },
]

const TYPE_LABELS = Object.fromEntries(TYPE_OPTIONS.map((option) => [option.value, option.label]))

export default function AdminWorkplaces() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [activeFilter, setActiveFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, setData, loading, error, forbidden, reload } = useAdminData(
    () => getWorkplaces({ search: debouncedSearch, is_active: activeFilter }),
    [debouncedSearch, activeFilter],
  )

  const workplaces = unwrapList(data)

  function openCreate() {
    setEditing({ id: null })
    setForm(EMPTY_FORM)
  }

  function openEdit(workplace) {
    setEditing(workplace)
    setForm({
      name: workplace.name || '',
      workplace_type: workplace.workplace_type || 'manicure_table',
      is_active: Boolean(workplace.is_active),
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        workplace_type: form.workplace_type,
        is_active: form.is_active,
      }

      const saved = editing.id
        ? await updateWorkplace(editing.id, payload)
        : await createWorkplace(payload)

      setData((current) => {
        const list = unwrapList(current)

        return {
          ...(Array.isArray(current) ? {} : current),
          results: editing.id
            ? list.map((item) => (item.id === editing.id ? saved : item))
            : [saved, ...list],
        }
      })

      setEditing(null)
      toast.success(editing.id ? 'Рабочее место обновлено' : 'Рабочее место создано')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось сохранить рабочее место'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)

    try {
      await deleteWorkplace(deleting.id)
      setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== deleting.id),
      }))
      setDeleting(null)
      toast.success('Рабочее место удалено')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось удалить рабочее место'))
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (row) => <span className="text-xs text-[var(--color-muted)]">#{row.id}</span>,
    },
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      render: (row) => <span className="font-medium text-[var(--color-plum)]">{row.name}</span>,
    },
    {
      key: 'workplace_type',
      label: 'Тип',
      sortable: true,
      render: (row) => TYPE_LABELS[row.workplace_type] || row.workplace_type,
    },
    {
      key: 'is_active',
      label: 'Активно',
      sortable: true,
      render: (row) => <BoolBadge value={row.is_active} />,
    },
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
  ]

  return (
    <section>
      <PageHeader
        title="Рабочие места"
        description="Столы и кресла салона. Тип места учитывается при подборе свободного слота."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-[var(--color-plum)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)]"
          >
            + Добавить место
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
                placeholder="Название рабочего места"
                className={inputClass}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
                Активность
              </span>
              <select
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value)}
                className={inputClass}
              >
                <option value="">Все места</option>
                <option value="true">Только активные</option>
                <option value="false">Только неактивные</option>
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
              columns={columns}
              rows={workplaces}
              loading={loading}
              emptyText="Рабочие места не найдены"
              pageSize={15}
            />
          </TableSection>

          {error && <ErrorPanel message={errorText(error, 'Не удалось загрузить рабочие места')} />}
        </>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? 'Редактировать рабочее место' : 'Новое рабочее место'}
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
              form="workplace-form"
              disabled={saving}
              className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        }
      >
        <form id="workplace-form" onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Название">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={inputClass}
              required
            />
          </Field>
          <SelectField
            label="Тип"
            value={form.workplace_type}
            onChange={(event) => setForm({ ...form, workplace_type: event.target.value })}
            options={TYPE_OPTIONS}
          />
          <CheckboxField
            label="Место активно"
            description="Используется при записи клиентов"
            checked={form.is_active}
            onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Удаление рабочего места"
        message={`Удалить рабочее место «${deleting?.name || ''}»?`}
        busy={busy}
      />
    </section>
  )
}
