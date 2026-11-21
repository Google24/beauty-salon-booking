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
  createService,
  deleteService,
  getCategories,
  getServices,
  unwrapList,
  updateService,
} from '../../api/admin'
import { useAdminData, useDebouncedValue } from '../../hooks/useAdminData'
import { WORKPLACE_TYPES, errorText, formatMoney } from '../../utils/admin'

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  duration_min: '',
  buffer_min: '0',
  category: '',
  required_workplace_type: 'any',
  is_active: true,
}

const WORKPLACE_TYPE_OPTIONS = [
  { value: 'any', label: 'Любое рабочее место' },
  { value: 'manicure_table', label: 'Маникюрный стол' },
  { value: 'pedicure_chair', label: 'Педикюрное кресло' },
]

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Только активные' },
  { value: 'false', label: 'Только неактивные' },
]

export default function AdminServices() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [inline, setInline] = useState(null)
  const [inlineSavingId, setInlineSavingId] = useState(null)

  const { data, setData, loading, error, forbidden, reload } = useAdminData(
    () =>
      getServices({
        search: debouncedSearch,
        category: categoryFilter,
        is_active: activeFilter,
      }),
    [debouncedSearch, categoryFilter, activeFilter],
  )

  const { data: categoriesData } = useAdminData(() => getCategories(), [])

  const services = unwrapList(data)
  const categories = unwrapList(categoriesData)
  const categoryOptions = categories.map((category) => ({
    value: String(category.id),
    label: category.name,
  }))

  function updateForm(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  function openCreate() {
    setEditing({ id: null })
    setForm(EMPTY_FORM)
  }

  function openEdit(service) {
    setEditing(service)
    setForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price ?? '',
      duration_min: service.duration_min ?? '',
      buffer_min: service.buffer_min ?? 0,
      category: service.category ? String(service.category) : '',
      required_workplace_type: service.required_workplace_type || 'any',
      is_active: Boolean(service.is_active),
    })
  }

  function applySaved(saved, editingId) {
    setData((current) => {
      const list = unwrapList(current)

      return {
        ...(Array.isArray(current) ? {} : current),
        results: editingId
          ? list.map((item) => (item.id === editingId ? saved : item))
          : [saved, ...list],
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        duration_min: Number(form.duration_min),
        buffer_min: Number(form.buffer_min || 0),
        category: Number(form.category),
        required_workplace_type: form.required_workplace_type,
        is_active: form.is_active,
      }

      const saved = editing.id
        ? await updateService(editing.id, payload)
        : await createService(payload)

      applySaved(saved, editing.id)
      setEditing(null)
      toast.success(editing.id ? 'Услуга обновлена' : 'Услуга создана')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось сохранить услугу'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)

    try {
      await deleteService(deleting.id)
      setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== deleting.id),
      }))
      setDeleting(null)
      toast.success('Услуга удалена')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось удалить услугу'))
    } finally {
      setBusy(false)
    }
  }

  async function saveInline(row) {
    setInlineSavingId(row.id)

    try {
      const saved = await updateService(row.id, {
        price: Number(inline.price),
        duration_min: Number(inline.duration_min),
        buffer_min: Number(inline.buffer_min || 0),
        is_active: inline.is_active,
      })

      applySaved(saved, row.id)
      setInline(null)
      toast.success('Услуга обновлена')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось сохранить изменения'))
    } finally {
      setInlineSavingId(null)
    }
  }

  function inlineInput(name, value) {
    setInline((current) => ({ ...current, [name]: value }))
  }

  const columns = [
    {
      key: 'name',
      label: 'Название',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-plum)]">{row.name}</p>
          {row.description && (
            <p className="mt-0.5 max-w-xs truncate text-xs text-[var(--color-muted)]">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Категория',
      sortable: true,
      sortValue: (row) => row.category_name || '',
      render: (row) => <Badge tone="neutral">{row.category_name || '—'}</Badge>,
    },
    {
      key: 'price',
      label: 'Цена',
      sortable: true,
      sortValue: (row) => Number(row.price),
      render: (row) =>
        inline?.id === row.id ? (
          <input
            type="number"
            min="0"
            step="0.01"
            value={inline.price}
            onChange={(event) => inlineInput('price', event.target.value)}
            className={`${inputClass} min-h-9 w-28 px-2 py-1 text-xs`}
          />
        ) : (
          formatMoney(row.price)
        ),
    },
    {
      key: 'duration_min',
      label: 'Длительность',
      sortable: true,
      render: (row) =>
        inline?.id === row.id ? (
          <input
            type="number"
            min="1"
            value={inline.duration_min}
            onChange={(event) => inlineInput('duration_min', event.target.value)}
            className={`${inputClass} min-h-9 w-20 px-2 py-1 text-xs`}
          />
        ) : (
          `${row.duration_min} мин.`
        ),
    },
    {
      key: 'buffer_min',
      label: 'Буфер',
      sortable: true,
      render: (row) =>
        inline?.id === row.id ? (
          <input
            type="number"
            min="0"
            value={inline.buffer_min}
            onChange={(event) => inlineInput('buffer_min', event.target.value)}
            className={`${inputClass} min-h-9 w-20 px-2 py-1 text-xs`}
          />
        ) : (
          `${row.buffer_min || 0} мин.`
        ),
    },
    {
      key: 'required_workplace_type',
      label: 'Место',
      render: (row) => (
        <span className="text-xs text-[var(--color-muted)]">
          {WORKPLACE_TYPES[row.required_workplace_type] || row.required_workplace_type}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Активна',
      sortable: true,
      render: (row) =>
        inline?.id === row.id ? (
          <input
            type="checkbox"
            checked={inline.is_active}
            onChange={(event) => inlineInput('is_active', event.target.checked)}
            className="h-4 w-4 accent-[var(--color-plum)]"
          />
        ) : (
          <BoolBadge value={row.is_active} />
        ),
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (row) =>
        inline?.id === row.id ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveInline(row)}
              disabled={inlineSavingId === row.id}
              className="rounded-lg bg-[var(--color-plum)] px-3 py-1.5 text-xs text-white disabled:opacity-50"
            >
              {inlineSavingId === row.id ? '...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={() => setInline(null)}
              className="rounded-lg border border-[var(--color-sand)] px-3 py-1.5 text-xs text-[var(--color-muted)]"
            >
              Отмена
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setInline({
                  id: row.id,
                  price: row.price,
                  duration_min: row.duration_min,
                  buffer_min: row.buffer_min ?? 0,
                  is_active: Boolean(row.is_active),
                })
              }}
              className="rounded-lg border border-[var(--color-sand)] px-3 py-1.5 text-xs text-[var(--color-plum)]"
            >
              Быстро
            </button>
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
        title="Услуги"
        description="Цена, длительность и буфер после услуги. Быстрое редактирование — прямо в таблице."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-[var(--color-plum)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)]"
          >
            + Добавить услугу
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
                placeholder="Название или описание"
                className={inputClass}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
                Категория
              </span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className={inputClass}
              >
                <option value="">Все категории</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                <option value="">Все услуги</option>
                {ACTIVE_OPTIONS.map((option) => (
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
              columns={columns}
              rows={services}
              loading={loading}
              emptyText="Услуги не найдены"
              pageSize={15}
            />
          </TableSection>

          {error && <ErrorPanel message={errorText(error, 'Не удалось загрузить услуги')} />}
        </>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? 'Редактировать услугу' : 'Новая услуга'}
        size="lg"
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
              form="service-form"
              disabled={saving}
              className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Название" className="sm:col-span-2">
            <input
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Категория">
            <select
              value={form.category}
              onChange={(event) => updateForm('category', event.target.value)}
              className={inputClass}
              required
            >
              <option value="">Выберите категорию</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <SelectField
            label="Требуемое рабочее место"
            value={form.required_workplace_type}
            onChange={(event) => updateForm('required_workplace_type', event.target.value)}
            options={WORKPLACE_TYPE_OPTIONS}
          />
          <Field label="Цена, ₽">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateForm('price', event.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Длительность, минут">
            <input
              type="number"
              min="1"
              value={form.duration_min}
              onChange={(event) => updateForm('duration_min', event.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Буфер после услуги, минут">
            <input
              type="number"
              min="0"
              value={form.buffer_min}
              onChange={(event) => updateForm('buffer_min', event.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="flex items-end">
            <CheckboxField
              label="Услуга активна"
              description="Отображается в каталоге и доступна для записи"
              checked={form.is_active}
              onChange={(event) => updateForm('is_active', event.target.checked)}
            />
          </div>
          <Field label="Описание" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              rows="4"
              className={`${inputClass} min-h-24 py-3`}
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Удаление услуги"
        message={`Удалить услугу «${deleting?.name || ''}»? Если она используется в записях, удаление может быть запрещено.`}
        busy={busy}
      />
    </section>
  )
}
