import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink } from 'react-router-dom'
import { changePassword, updateMe } from '../api/auth'
import { getMyBookings } from '../api/bookings'
import { useAuth } from '../context/AuthContext.jsx'

const emptyPasswords = { old_password: '', new_password: '', new_password2: '' }

const tabClass = ({ isActive }) =>
  `rounded-t-xl px-4 py-3 text-sm font-medium ${
    isActive
      ? 'bg-[var(--color-plum)] text-[var(--color-white)]'
      : 'text-[var(--color-muted)] hover:text-[var(--color-plum)]'
  }`

function StatCard({ label, value, href }) {
  const content = (
    <div className="rounded-2xl bg-[var(--color-white)] p-5 shadow-[0_14px_35px_rgba(74,48,71,0.08)] ring-1 ring-[var(--color-sand)]/70 transition hover:-translate-y-0.5 hover:shadow-lg">
      <p className="text-xs tracking-[0.08em] text-[var(--color-muted)] uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--color-plum)]">{value}</p>
      {href && <p className="mt-2 text-xs text-[var(--color-gold)]">Подробнее →</p>}
    </div>
  )

  return href ? <Link to={href}>{content}</Link> : content
}

function Profile() {
  const { token, user, updateUser, signOut } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [passwords, setPasswords] = useState(emptyPasswords)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    })
  }, [user])

  useEffect(() => {
    if (!token) return undefined

    let isMounted = true

    getMyBookings(token)
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data.results || []
          setBookings(list)
        }
      })
      .catch(() => {
        if (isMounted) setBookings([])
      })

    return () => {
      isMounted = false
    }
  }, [token])

  const now = Date.now()
  const upcoming = bookings.filter(
    (booking) => new Date(booking.start_at).getTime() >= now && booking.status !== 'cancelled',
  ).length
  const completed = bookings.filter((booking) => booking.status === 'done').length
  const reviewsLeft = bookings.filter((booking) => booking.has_review).length

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    try {
      const updatedUser = await updateMe(form, token)
      updateUser(updatedUser)
      toast.success('Изменения сохранены')
    } catch (requestError) {
      toast.error(requestError.data?.detail || 'Не удалось сохранить изменения')
    } finally {
      setIsSaving(false)
    }
  }

  function closePasswordModal() {
    if (!isPasswordSaving) {
      setIsPasswordModalOpen(false)
      setPasswords(emptyPasswords)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setIsPasswordSaving(true)
    try {
      await changePassword(passwords, token)
      toast.success('Пароль успешно изменён')
      setIsPasswordModalOpen(false)
      setPasswords(emptyPasswords)
    } catch (requestError) {
      const responseData = requestError.data
      toast.error(responseData?.detail || Object.values(responseData || {})[0]?.[0] || 'Не удалось изменить пароль')
    } finally {
      setIsPasswordSaving(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Личный кабинет
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Здравствуйте{user?.first_name ? `, ${user.first_name}` : ''}!
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Здесь собраны ваши данные, записи и отзывы.
      </p>

      <nav className="mt-6 flex gap-2 border-b border-[var(--color-sand)]" aria-label="Разделы личного кабинета">
        <NavLink to="/profile" end className={tabClass}>Мои данные</NavLink>
        <NavLink to="/my-bookings" className={tabClass}>Мои записи</NavLink>
        <NavLink to="/reviews" className={tabClass}>Отзывы</NavLink>
      </nav>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Всего записей" value={bookings.length} href="/my-bookings" />
        <StatCard label="Предстоящие" value={upcoming} href="/my-bookings" />
        <StatCard label="Завершено" value={completed} href="/my-bookings" />
        <StatCard label="Оставлено отзывов" value={reviewsLeft} href="/reviews" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
        >
          <h2 className="text-xl font-semibold text-[var(--color-plum-deep)]">Личные данные</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Email изменить нельзя — он используется для входа.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-[var(--color-muted)]">Email</p>
              <p className="mt-1 font-medium text-[var(--color-ink)]">{user?.email || '—'}</p>
            </div>
            {['first_name', 'last_name', 'phone'].map((field) => (
              <label key={field} className="block text-sm font-medium text-[var(--color-plum)]">
                {field === 'first_name' ? 'Имя' : field === 'last_name' ? 'Фамилия' : 'Телефон'}
                <input
                  name={field}
                  type={field === 'phone' ? 'tel' : 'text'}
                  value={form[field]}
                  onChange={handleFormChange}
                  required={field !== 'phone'}
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 outline-none focus:border-[var(--color-gold)]"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={isSaving} className="min-h-11 rounded-xl bg-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-white)] disabled:opacity-60">
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="min-h-11 rounded-xl border border-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-plum)]">
              Сменить пароль
            </button>
            <button type="button" onClick={signOut} className="min-h-11 rounded-xl border border-[#8e3f4a] px-5 py-2 text-sm font-medium text-[#8e3f4a]">
              Выйти
            </button>
          </div>
        </form>

        <div className="space-y-5">
          <div className="rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
            <h2 className="text-xl font-semibold text-[var(--color-plum-deep)]">Быстрые действия</h2>
            <div className="mt-4 space-y-2">
              <Link to="/booking" className="block rounded-xl bg-[var(--color-plum)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)]">
                Записаться на услугу →
              </Link>
              <Link to="/my-bookings" className="block rounded-xl border border-[var(--color-sand)] px-4 py-3 text-sm font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)]">
                Мои записи →
              </Link>
              <Link to="/reviews" className="block rounded-xl border border-[var(--color-sand)] px-4 py-3 text-sm font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)]">
                Что говорят клиенты →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-plum)] p-6 text-white shadow-lg">
            <p className="text-xs tracking-[0.12em] uppercase opacity-75">Аккаунт</p>
            <p className="mt-3 text-lg font-medium">
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email}
            </p>
            <p className="mt-1 text-sm opacity-80">{user?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1">
                Роль: {user?.role || '—'}
              </span>
              {user?.created_at && (
                <span className="rounded-full bg-white/15 px-3 py-1">
                  С нами с {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
          <form onSubmit={handlePasswordSubmit} className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-6 shadow-2xl">
            <h2 id="password-modal-title" className="text-2xl font-semibold text-[var(--color-plum-deep)]">Смена пароля</h2>
            <div className="mt-5 space-y-4">
              {Object.entries({ old_password: 'Старый пароль', new_password: 'Новый пароль', new_password2: 'Повторите новый пароль' }).map(([name, label]) => (
                <label key={name} className="block text-sm font-medium text-[var(--color-plum)]">{label}<input name={name} type="password" value={passwords[name]} onChange={(event) => setPasswords((current) => ({ ...current, [name]: event.target.value }))} required minLength={name !== 'old_password' ? 8 : undefined} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 outline-none focus:border-[var(--color-plum)]" /></label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closePasswordModal} disabled={isPasswordSaving} className="rounded-xl border border-[var(--color-plum)] px-4 py-2 text-sm text-[var(--color-plum)]">Отмена</button><button type="submit" disabled={isPasswordSaving} className="rounded-xl bg-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-white)]">{isPasswordSaving ? 'Сохранение...' : 'Сохранить'}</button></div>
          </form>
        </div>
      )}
    </section>
  )
}

export default Profile
