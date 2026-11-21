import { useState } from 'react'
import toast from 'react-hot-toast'
import AdminTable from '../../components/AdminTable'
import {
  ErrorPanel,
  Field,
  FilterPanel,
  PageHeader,
  TableSection,
  inputClass,
} from '../../components/AdminUI'
import ConfirmDialog from '../../components/Modals/ConfirmDialog'
import Modal from '../../components/Modals/Modal'
import {
  createCategory,
  deleteCategory,
  getCategories,
  unwrapList,
  updateCategory,
} from '../../api/admin'
import { useAdminData, useDebouncedValue } from '../../hooks/useAdminData'
import { errorText } from '../../utils/admin'

export default function AdminCategories() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const { data, setData, loading, error, forbidden, reload } = useAdminData(
    () => getCategories({ search: debouncedSearch }),
    [debouncedSearch],
  )

  const categories = unwrapList(data)

  function openCreate() {
    setEditing({ id: null })
    setName('')
  }

  function openEdit(category) {
    setEditing(category)
    setName(category.name || '')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const saved = editing.id
        ? await updateCategory(editing.id, { name: name.trim() })
        : await createCategory({ name: name.trim() })

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
      toast.success(editing.id ? 'Категория обновлена' : 'Категория создана')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось сохранить категорию'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)

    try {
      await deleteCategory(deleting.id)
      setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== deleting.id),
      }))
      setDeleting(null)
      toast.success('Категория удалена')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось удалить категорию'))
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
      key: 'actions',
      label: 'Действия',
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEdit(row)}
            className="rounded-lg border border-[var(--color-sand)] px-3 py-1.5 text-xs text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)]"
          >
            Изменить
          </button>
          <button
            type="button"
            onClick={() => setDeleting(row)}
            className="rounded-lg border border-[#d6aeb3] px-3 py-1.5 text-xs text-[#8e3f4a] transition hover:bg-[#fbecee]"
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
        title="Категории услуг"
        description="Создавайте, переименовывайте и удаляйте категории каталога."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-[var(--color-plum)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)]"
          >
            + Добавить категорию
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
                Поиск по названию
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Например, Маникюр"
                className={inputClass}
              />
            </label>
            <div className="flex items-end lg:col-span-2">
              <button
                type="button"
                onClick={reload}
                className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-4 py-2 text-sm text-[var(--color-plum)]"
              >
                Обновить список
              </button>
            </div>
          </FilterPanel>

          <TableSection>
            <AdminTable
              columns={columns}
              rows={categories}
              loading={loading}
              emptyText="Категории не найдены"
              pageSize={15}
            />
          </TableSection>

          {error && <ErrorPanel message={errorText(error, 'Не удалось загрузить категории')} />}
        </>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? 'Редактировать категорию' : 'Новая категория'}
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
              form="category-form"
              disabled={saving}
              className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit}>
          <Field label="Название">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Название категории"
              className={inputClass}
              required
              autoFocus
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Удаление категории"
        message={`Удалить категорию «${deleting?.name || ''}»? Услуги этой категории нужно будет перенести в другую.`}
        busy={busy}
      />
    </section>
  )
}
