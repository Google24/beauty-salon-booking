import { useState } from 'react'
import toast from 'react-hot-toast'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../context/AuthContext.jsx'

function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function getServerError(requestError) {
    const data = requestError.data

    if (data?.email?.[0]) return data.email[0]
    if (data?.password2?.[0]) return data.password2[0]
    if (data?.detail) return data.detail

    return 'Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.'
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    toast.dismiss()
    setIsSubmitting(true)

    try {
      await register(form)
      await signIn(form.email, form.password)
      navigate('/')
    } catch (requestError) {
      toast.error(getServerError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md">
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Личный кабинет
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)]">
        Регистрация
      </h1>

      {error && (
        <p className="mt-5 rounded-xl bg-[#f8e4e5] px-4 py-3 text-sm text-[#8e3f4a]" role="alert">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70"
      >
        <div>
          <label htmlFor="first-name" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Имя
          </label>
          <input id="first-name" name="first_name" type="text" value={form.first_name} onChange={handleChange} required className="min-h-12 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]" />
        </div>

        <div>
          <label htmlFor="last-name" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Фамилия
          </label>
          <input id="last-name" name="last_name" type="text" value={form.last_name} onChange={handleChange} required className="min-h-12 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]" />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Email
          </label>
          <input id="register-email" name="email" type="email" value={form.email} onChange={handleChange} required className="min-h-12 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]" />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Телефон
          </label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required className="min-h-12 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]" />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Пароль
          </label>
          <input id="register-password" name="password" type="password" value={form.password} onChange={handleChange} required className="min-h-12 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]" />
        </div>

        <div>
          <label htmlFor="register-password2" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Повторите пароль
          </label>
          <input id="register-password2" name="password2" type="password" value={form.password2} onChange={handleChange} required className="min-h-12 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[var(--color-plum)] px-4 py-3 font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)] disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
        Уже есть аккаунт?{' '}
        <NavLink to="/login" state={location.state} className="font-medium text-[var(--color-plum)] hover:text-[var(--color-gold)]">
          Войти
        </NavLink>
      </p>
    </section>
  )
}

export default Register