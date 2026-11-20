import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NavLink } from 'react-router-dom'
import { changePassword, updateMe } from '../api/auth'
import { useAuth } from '../context/AuthContext.jsx'

const emptyPasswords = { old_password: '', new_password: '', new_password2: '' }

function Profile() {
  const { token, user, updateUser, signOut } = useAuth()
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [passwords, setPasswords] = useState(emptyPasswords)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)

  useEffect(() => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
    })
  }, [user])

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
    <section className="mx-auto w-full max-w-3xl">
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">Личный кабинет</p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">Мои данные</h1>
      <nav className="mt-6 flex gap-2 border-b border-[var(--color-sand)]" aria-label="Разделы личного кабинета">
        <NavLink to="/profile" end className={({ isActive }) => `rounded-t-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-[var(--color-plum)] text-[var(--color-white)]' : 'text-[var(--color-muted)] hover:text-[var(--color-plum)]'}`}>Мои данные</NavLink>
        <NavLink to="/my-bookings" className={({ isActive }) => `rounded-t-xl px-4 py-3 text-sm font-medium ${isActive ? 'bg-[var(--color-plum)] text-[var(--color-white)]' : 'text-[var(--color-muted)] hover:text-[var(--color-plum)]'}`}>Мои записи</NavLink>
      </nav>

      <form onSubmit={handleProfileSubmit} className="mt-8 space-y-5 rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
        <div>
          <p className="text-sm text-[var(--color-muted)]">Email</p>
          <p className="mt-1 font-medium text-[var(--color-ink)]">{user?.email || '—'}</p>
        </div>
        {['first_name', 'last_name', 'phone'].map((field) => (
          <label key={field} className="block text-sm font-medium text-[var(--color-plum)]">
            {field === 'first_name' ? 'Имя' : field === 'last_name' ? 'Фамилия' : 'Телефон'}
            <input name={field} type={field === 'phone' ? 'tel' : 'text'} value={form[field]} onChange={handleFormChange} required={field !== 'phone'} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 outline-none focus:border-[var(--color-gold)]" />
          </label>
        ))}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={isSaving} className="min-h-11 rounded-xl bg-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-white)] disabled:opacity-60">{isSaving ? 'Сохранение...' : 'Сохранить изменения'}</button>
          <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="min-h-11 rounded-xl border border-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-plum)]">Сменить пароль</button>
          <button type="button" onClick={signOut} className="min-h-11 rounded-xl border border-[#8e3f4a] px-5 py-2 text-sm font-medium text-[#8e3f4a]">Выйти</button>
        </div>
      </form>

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