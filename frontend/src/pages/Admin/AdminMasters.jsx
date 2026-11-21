import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdminTable from '../../components/AdminTable'
import {
  Avatar,
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
import MasterInlineEditor from '../../components/Modals/MasterInlineEditor'
import Modal from '../../components/Modals/Modal'
import {
  createMaster,
  deleteMaster,
  getMasters,
  getUsers,
  unwrapList,
  updateMaster,
} from '../../api/admin'
import { useAdminData, useDebouncedValue } from '../../hooks/useAdminData'
import {
  SPECIALIZATION_LABELS,
  errorText,
  fullName,
  toFormData,
} from '../../utils/admin'

const EMPTY_FORM = {
  user: '',
  display_name: '',
  specialization: 'master_manicure',
  info: '',
  is_active: true,
}

export default function AdminMasters() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [inlineMaster, setInlineMaster] = useState(null)

  const { data, setData, loading, error, forbidden, reload } = useAdminData(
    () => getMasters({ search: debouncedSearch }),
    [debouncedSearch],
  )

  const { data: usersData } = useAdminData(() => getUsers(), [])

  const masters = unwrapList(data)
  const users = unwrapList(usersData)
  const masterUsers = users.filter((user) => user.role === 'master')

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  function openCreate() {
    setEditing({ id: null })
    setForm(EMPTY_FORM)
    setPhoto(null)
    setPhotoPreview(null)
  }

  function openEdit(master) {
    setEditing(master)
    setForm({
      user: master.user ? String(master.user) : '',
      display_name: master.display_name || '',
      specialization: master.specialization || 'master_manicure',
      info: master.info || '',
      is_active: Boolean(master.is_active),
    })
    setPhoto(null)
    setPhotoPreview(null)
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0] || null

    setPhoto(file)

    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(file ? URL.createObjectURL(file) : null)
  }

  function userOptions() {
    const options = masterUsers.map((user) => ({
      value: String(user.id),
      label: `${fullName(user)} · ${user.email}`,
    }))

    const currentUserId = form.user ? Number(form.user) : null

    if (
      currentUserId &&
      !options.some((option) => Number(option.value) === currentUserId)
    ) {
      const current = users.find((user) => user.id === currentUserId)

      if (current) {
        options.unshift({
          value: String(current.id),
          label: `${fullName(current)} · ${current.email}`,
        })
      }
    }

    return options
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      const payload = toFormData(
        {
          user: Number(form.user),
          display_name: form.display_name.trim(),
          specialization: form.specialization,
          info: form.info.trim(),
          is_active: form.is_active,
        },
        'photo',
        photo,
      )

      const saved = editing.id
        ? await updateMaster(editing.id, payload)
        : await createMaster(payload)

      setData((current) => {
        const list = unwrapList(current)

        return {
          ...(Array.isArray(current) ? {} : current),
          results: editing.id
            ? list.map((item) => (item.id === editing.id ? { ...item, ...saved } : item))
            : [saved, ...list],
        }
      })

      setEditing(null)
      toast.success(editing.id ? 'Профиль мастера обновлён' : 'Мастер добавлен')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось сохранить мастера'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)

    try {
      await deleteMaster(deleting.id)
      setData((current) => ({
        ...(Array.isArray(current) ? {} : current),
        results: unwrapList(current).filter((item) => item.id !== deleting.id),
      }))
      setDeleting(null)
      toast.success('Мастер удалён')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось удалить мастера'))
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    {
      key: 'photo',
      label: 'Фото',
      render: (row) => <Avatar src={row.photo} name={row.display_name} size="sm" />,
    },
    {
      key: 'display_name',
      label: 'Имя',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-plum)]">{row.display_name}</p>
          <p className="text-xs text-[var(--color-muted)]">{row.user_email || '—'}</p>
        </div>
      ),
    },
    {
      key: 'specialization',
      label: 'Специализация',
      sortable: true,
      render: (row) =>
        SPECIALIZATION_LABELS[row.specialization] || row.specialization || '—',
    },
    {
      key: 'services',
      label: 'Услуг',
      sortable: true,
      sortValue: (row) => row.services?.length || 0,
      render: (row) => row.services?.length || 0,
    },
    {
      key: 'is_active',
      label: 'Активен',
      sortable: true,
      render: (row) => <BoolBadge value={row.is_active} />,
    },
    {
      key: 'actions',
      label: 'Действия',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInlineMaster(row)}
            className="rounded-lg bg-[var(--color-plum)] px-3 py-1.5 text-xs font-medium text-white"
          >
            Управлять
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
        title="Мастера"
        description="Профили и фотографии. Внутри профиля — услуги мастера, смены и отсутствия."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl bg-[var(--color-plum)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)]"
          >
            + Добавить мастера
          </button>
        }
      />

      {forbidden ? (
        <ErrorPanel message="Доступ запрещён" />
      ) : (
        <>
          <FilterPanel>
            <label className="lg:col-span-3">
              <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
                Поиск
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Имя, специализация или email"
                className={inputClass}
              />
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
              rows={masters}
              loading={loading}
              emptyText="Мастера не найдены"
              pageSize={15}
            />
          </TableSection>

          {error && <ErrorPanel message={errorText(error, 'Не удалось загрузить мастеров')} />}
        </>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? 'Редактировать мастера' : 'Новый мастер'}
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
              form="master-form"
              disabled={saving}
              className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        }
      >
        <form id="master-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Пользователь"
            hint="Доступны пользователи с ролью «Мастер»"
            value={form.user}
            onChange={(event) => setForm({ ...form, user: event.target.value })}
            options={userOptions()}
            placeholder="Выберите пользователя"
            className="sm:col-span-2"
          />
          <Field label="Имя, которое видят клиенты">
            <input
              value={form.display_name}
              onChange={(event) => setForm({ ...form, display_name: event.target.value })}
              className={inputClass}
              required
            />
          </Field>
          <SelectField
            label="Специализация"
            value={form.specialization}
            onChange={(event) => setForm({ ...form, specialization: event.target.value })}
            options={Object.entries(SPECIALIZATION_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          <div className="sm:col-span-2">
            <Field label="Фотография" hint="JPG, PNG или WebP. Загружается через FormData.">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className={`${inputClass} py-2`}
              />
            </Field>
            {(photoPreview || editing?.photo) && (
              <div className="mt-3">
                <Avatar
                  src={photoPreview || editing?.photo}
                  name={form.display_name}
                  size="md"
                />
              </div>
            )}
          </div>
          <Field label="О себе" className="sm:col-span-2">
            <textarea
              value={form.info}
              onChange={(event) => setForm({ ...form, info: event.target.value })}
              rows="4"
              className={`${inputClass} min-h-24 py-3`}
            />
          </Field>
          <div className="sm:col-span-2">
            <CheckboxField
              label="Мастер работает в салоне"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Удаление мастера"
        message={`Удалить профиль мастера «${deleting?.display_name || ''}»? Связанные записи и расписание будут удалены.`}
        busy={busy}
      />

      <Modal
        open={Boolean(inlineMaster)}
        onClose={() => setInlineMaster(null)}
        title={`Управление: ${inlineMaster?.display_name || ''}`}
        subtitle="Услуги, расписание и отсутствия мастера"
        size="xl"
      >
        {inlineMaster && (
          <MasterInlineEditor master={inlineMaster} onClose={() => setInlineMaster(null)} />
        )}
      </Modal>
    </section>
  )
}
