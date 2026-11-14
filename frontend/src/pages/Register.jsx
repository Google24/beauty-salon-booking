import { NavLink } from 'react-router-dom'

function Register() {
  return (
    <section className="mx-auto w-full max-w-md">
      <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
        Личный кабинет
      </p>
      <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)]">
        Регистрация
      </h1>

      <form className="mt-8 space-y-5 rounded-2xl bg-[var(--color-white)] p-6 shadow-[0_14px_35px_rgba(74,48,71,0.1)] ring-1 ring-[var(--color-sand)]/70">
        <div>
          <label htmlFor="first-name" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Имя
          </label>
          <input
            id="first-name"
            name="first_name"
            type="text"
            required
            className="w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
          />
        </div>

        <div>
          <label htmlFor="last-name" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Фамилия
          </label>
          <input
            id="last-name"
            name="last_name"
            type="text"
            required
            className="w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
          />
        </div>

        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Телефон
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
          />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-[var(--color-plum)]">
            Пароль
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-gold)]"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[var(--color-plum)] px-4 py-3 font-medium text-[var(--color-white)] transition hover:bg-[var(--color-plum-deep)]"
        >
          Зарегистрироваться
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
        Уже есть аккаунт?{' '}
        <NavLink to="/login" className="font-medium text-[var(--color-plum)] hover:text-[var(--color-gold)]">
          Войти
        </NavLink>
      </p>
    </section>
  )
}

export default Register