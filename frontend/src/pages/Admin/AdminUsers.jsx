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
import Modal from '../../components/Modals/Modal'
import { getUsers, unwrapList, updateUser } from '../../api/admin'
import { useAdminData, useDebouncedValue } from '../../hooks/useAdminData'
import { ROLE_LABELS, ROLE_OPTIONS, errorText, formatDate } from '../../utils/admin'

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  phone: '',
  role: 'client',
  is_active: true,
  is_staff: false,
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const { data, setData, loading, error, forbidden, reload } = useAdminData(
    () => getUsers({ search: debouncedSearch, ordering: 'email' }),
    [debouncedSearch],
  )

  const users = unwrapList(data)

  function openEdit(user) {
    setEditing(user)
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role || 'client',
      is_active: Boolean(user.is_active),
      is_staff: Boolean(user.is_staff),
    })
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!editing) return

    setSaving(true)

    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        role: form.role,
        is_active: form.is_active,
        is_staff: form.is_staff,
      }

      const updated = await updateUser(editing.id, payload)

      setData((currentData) => {
        const list = unwrapList(currentData)

        return {
          ...(Array.isArray(currentData) ? {} : currentData),
          results: list.map((user) => (user.id === updated.id ? { ...user, ...updated } : user)),
        }
      })

      setEditing(null)
      toast.success('Пользователь обновлён')
    } catch (requestError) {
      toast.error(errorText(requestError, 'Не удалось сохранить пользователя'))
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => <span className="font-medium text-[var(--color-plum)]">{row.email}</span>,
    },
    { key: 'first_name', label: 'Имя', sortable: true },
    { key: 'last_name', label: 'Фамилия', sortable: true },
    {
      key: 'role',
      label: 'Роль',
      sortable: true,
      render: (row) => <Badge tone={row.role === 'admin' ? 'plum' : row.role === 'master' ? 'gold' : 'neutral'}>{ROLE_LABELS[row.role] || row.role}</Badge>,
    },
    {
      key: 'is_active',
      label: 'Активен',
      sortable: true,
      render: (row) => <BoolBadge value={row.is_active} />,
    },
    {
      key: 'is_staff',
      label: 'Staff',
      sortable: true,
      render: (row) => <BoolBadge value={row.is_staff} trueLabel="Да" falseLabel="Нет" />,
    },
    {
      key: 'created_at',
      label: 'Создан',
      render: (row) => <span className="text-xs text-[var(--color-muted)]">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button
          type="button"
          onClick={() => openEdit(row)}
          className="rounded-lg border border-[var(--color-sand)] px-3 py-1.5 text-xs font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)]"
        >
          Изменить
        </button>
      ),
    },
  ]

  if (forbidden) {
    return (
      <section>
        <PageHeader title="Пользователи" />
        <ErrorPanel message="Доступ запрещён" />
      </section>
    )
  }

  return (
    <section>
      <PageHeader
        title="Пользователи"
        description="Роли, поиск и доступ. Пароль меняется только через отдельный эндпоинт смены пароля."
        actions={
          <button
            type="button"
            onClick={reload}
            className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-4 py-2 text-sm text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)]"
          >
            Обновить
          </button>
        }
      />

      <FilterPanel>
        <label className="lg:col-span-2">
          <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
            Поиск
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Email, имя или фамилия"
            className={inputClass}
          />
        </label>
        <div className="flex items-end lg:col-span-2">
          <p className="text-xs text-[var(--color-muted)]">
            Найдено: <span className="font-semibold text-[var(--color-plum)]">{users.length}</span>
          </p>
        </div>
      </FilterPanel>

      <TableSection>
        <AdminTable
          columns={columns}
          rows={users}
          loading={loading}
          emptyText="Пользователи не найдены"
          onRowClick={openEdit}
          pageSize={15}
        />
      </TableSection>

      {error && !forbidden && <ErrorPanel message={errorText(error, 'Не удалось загрузить пользователей')} />}

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title="Редактирование пользователя"
        subtitle={editing?.email}
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
              form="user-edit-form"
              disabled={saving}
              className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </>
        }
      >
        <form id="user-edit-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" hint="Email недоступен для редактирования">
            <input value={editing?.email || ''} disabled className={inputClass} />
          </Field>
          <Field label="Пароль" hint="Пароль меняется только через смену пароля">
            <input type="password" value="••••••••" disabled className={inputClass} />
          </Field>
          <Field label="Имя">
            <input
              value={form.first_name}
              onChange={(event) => updateField('first_name', event.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Фамилия">
            <input
              value={form.last_name}
              onChange={(event) => updateField('last_name', event.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Телефон">
            <input
              value={form.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className={inputClass}
            />
          </Field>
          <SelectField
            label="Роль"
            value={form.role}
            onChange={(event) => updateField('role', event.target.value)}
            options={ROLE_OPTIONS}
          />
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
            <CheckboxField
              label="Активен"
              description="Пользователь может входить в систему"
              checked={form.is_active}
              onChange={(event) => updateField('is_active', event.target.checked)}
            />
            <CheckboxField
              label="Staff"
              description="Технический флаг Django"
              checked={form.is_staff}
              onChange={(event) => updateField('is_staff', event.target.checked)}
            />
          </div>
          {editing?.created_at && (
            <p className="text-xs text-[var(--color-muted)] sm:col-span-2">
              Дата регистрации: {formatDate(editing.created_at)}
            </p>
          )}
        </form>
      </Modal>
    </section>
  )
}
