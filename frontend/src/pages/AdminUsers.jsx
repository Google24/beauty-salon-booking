import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getUsers, updateUserRole } from '../api/admin'
import { useAuth } from '../context/AuthContext.jsx'

const roleLabels = {
  client: 'Клиент',
  master: 'Мастер',
  admin: 'Админ',
}

function getUsersList(data) {
  return Array.isArray(data) ? data : data?.results || []
}

function AdminUsers() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let isMounted = true
    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const data = await getUsers(search, token)
        if (isMounted) {
          setUsers(getUsersList(data))
        }
      } catch {
        if (isMounted) {
          setError('Не удалось загрузить пользователей')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }, 250)

    return () => {
      isMounted = false
      window.clearTimeout(timeoutId)
    }
  }, [search, token])

  async function handleRoleChange(id, role) {
    setUpdatingId(id)

    try {
      const updatedUser = await updateUserRole(id, role, token)
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === id ? { ...user, ...updatedUser, role } : user)),
      )
      toast.success('Роль пользователя обновлена')
    } catch (requestError) {
      const responseData = requestError.data
      const serverError =
        responseData?.detail ||
        Object.values(responseData || {})[0]?.[0] ||
        'Не удалось изменить роль пользователя'
      toast.error(serverError)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Администрирование
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Пользователи
      </h1>

      <div className="mt-8 rounded-2xl bg-[var(--color-white)] p-5 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70 sm:p-6">
        <label htmlFor="user-search" className="text-sm font-medium text-[var(--color-plum)]">
          Поиск по email
        </label>
        <input
          id="user-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Введите email пользователя"
          className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-cream)] px-4 text-sm outline-none transition focus:border-[var(--color-plum)] focus:ring-2 focus:ring-[var(--color-plum)]/15"
        />
      </div>

      {loading && <p className="mt-8 text-[var(--color-muted)]">Загрузка пользователей...</p>}
      {error && <p className="mt-8 text-[#8e3f4a]" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="mt-8 overflow-x-auto rounded-2xl bg-[var(--color-white)] shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
          <table className="w-full min-w-[620px] text-left text-sm">
            <caption className="sr-only">Список пользователей</caption>
            <thead className="border-b border-[var(--color-sand)]/80 text-xs tracking-[0.12em] text-[var(--color-muted)] uppercase">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">Email</th>
                <th scope="col" className="px-5 py-4 font-medium">Имя</th>
                <th scope="col" className="px-5 py-4 font-medium">Телефон</th>
                <th scope="col" className="px-5 py-4 font-medium">Роль</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-sand)]/60">
              {users.map((user) => (
                <tr key={user.id} className="align-middle">
                  <td className="px-5 py-4 font-medium text-[var(--color-ink)]">{user.email}</td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-muted)]">{user.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <label className="sr-only" htmlFor={`role-${user.id}`}>
                      Роль пользователя {user.email}
                    </label>
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      disabled={updatingId === user.id}
                      className="min-h-10 rounded-lg border border-[var(--color-sand)] bg-[var(--color-cream)] px-3 text-sm text-[var(--color-plum)] outline-none focus:border-[var(--color-plum)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="px-5 py-8 text-center text-[var(--color-muted)]">Пользователи не найдены</p>
          )}
        </div>
      )}
    </section>
  )
}

export default AdminUsers