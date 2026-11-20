import { useState } from 'react'
import toast from 'react-hot-toast'
import { changePassword } from '../api/auth'
import { useAuth } from '../context/AuthContext.jsx'

function Profile() {
  const { token, user } = useAuth()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function closeModal() {
    if (!isSubmitting) {
      setIsPasswordModalOpen(false)
      setPasswords({ old_password: '', new_password: '', new_password2: '' })
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setPasswords((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await changePassword(passwords, token)
      toast.success('Пароль успешно изменён')
      setIsPasswordModalOpen(false)
      setPasswords({ old_password: '', new_password: '', new_password2: '' })
    } catch (requestError) {
      const responseData = requestError.data
      const serverError =
        responseData?.detail ||
        Object.values(responseData || {})[0]?.[0] ||
        'Не удалось изменить пароль'
      toast.error(serverError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Личный кабинет
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
        Профиль
      </h1>
      <div className="mt-8 rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
        <p className="text-[var(--color-muted)]">Email</p>
        <p className="mt-1 font-medium text-[var(--color-ink)]">{user?.email || '—'}</p>
        <button
          type="button"
          onClick={() => setIsPasswordModalOpen(true)}
          className="mt-6 min-h-11 rounded-xl bg-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)]"
        >
          Сменить пароль
        </button>
      </div>

      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-6 shadow-2xl"
          >
            <h2 id="password-modal-title" className="text-2xl font-semibold text-[var(--color-plum-deep)]">
              Смена пароля
            </h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-[var(--color-plum)]">
                Старый пароль
                <input
                  name="old_password"
                  type="password"
                  value={passwords.old_password}
                  onChange={handleChange}
                  required
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 outline-none focus:border-[var(--color-plum)]"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--color-plum)]">
                Новый пароль
                <input
                  name="new_password"
                  type="password"
                  value={passwords.new_password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 outline-none focus:border-[var(--color-plum)]"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--color-plum)]">
                Повторите новый пароль
                <input
                  name="new_password2"
                  type="password"
                  value={passwords.new_password2}
                  onChange={handleChange}
                  required
                  minLength="8"
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 outline-none focus:border-[var(--color-plum)]"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="min-h-11 rounded-xl border border-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-plum)] disabled:opacity-60"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 rounded-xl bg-[var(--color-plum)] px-5 py-2 text-sm font-medium text-[var(--color-white)] disabled:opacity-60"
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

export default Profile