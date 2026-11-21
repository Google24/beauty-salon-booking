import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Layout({ children }) {
  const { user, signOut } = useAuth()
  const userLabel = user?.first_name || user?.email
  const isAdmin = user?.is_staff || user?.role === 'admin'
  const isMaster = user?.role === 'master'

  return (
    <div className="flex min-h-screen flex-col text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-sand)]/80 bg-[var(--color-white)]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-5 sm:px-8">
          <NavLink
            to="/"
            className="shrink-0 text-lg font-semibold tracking-[0.18em] text-[var(--color-plum)] uppercase"
          >
            Atelier beauté
          </NavLink>

          <nav
            aria-label="Основная навигация"
            className="hidden items-center gap-7 text-sm text-[var(--color-muted)] md:flex"
          >
            <NavLink
              to="/about"
              className="whitespace-nowrap transition-colors hover:text-[var(--color-plum)]"
            >
              О салоне
            </NavLink>
            <NavLink
              to="/services"
              className="transition-colors hover:text-[var(--color-plum)]"
            >
              Каталог услуг
            </NavLink>
            <NavLink
              to="/booking"
              className="transition-colors hover:text-[var(--color-plum)]"
            >
              Записаться
            </NavLink>
            <NavLink
              to="/masters"
              className="transition-colors hover:text-[var(--color-plum)]"
            >
              Мастера
            </NavLink>
            <NavLink
              to="/profile"
              className="transition-colors hover:text-[var(--color-plum)]"
            >
              Личный кабинет
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `whitespace-nowrap transition-colors ${isActive ? 'font-semibold text-[var(--color-plum-deep)]' : 'text-[var(--color-muted)] hover:text-[var(--color-plum)]'}`}
              >
                Админ-панель
              </NavLink>
            )}
            {isMaster && (
              <NavLink
                to="/master/bookings"
                className="transition-colors hover:text-[var(--color-plum)]"
              >
                Кабинет мастера
              </NavLink>
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <a href="tel:+79991234567" className="hidden whitespace-nowrap text-sm font-medium text-[var(--color-plum)] transition hover:text-[var(--color-gold)] xl:inline">
                +7 (999) 123-45-67
              </a>
              <span className="hidden text-sm font-medium text-[var(--color-plum)] sm:inline">
                {userLabel}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-plum)] transition-colors hover:bg-[var(--color-plum)] hover:text-[var(--color-white)]"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <a href="tel:+79991234567" className="hidden whitespace-nowrap text-sm font-medium text-[var(--color-plum)] transition hover:text-[var(--color-gold)] xl:inline">
                +7 (999) 123-45-67
              </a>
              <NavLink
                to="/login"
              className="rounded-full border border-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-plum)] transition-colors hover:bg-[var(--color-plum)] hover:text-[var(--color-white)]"
            >
                Войти
              </NavLink>
            </div>
          )}
        </div>

        <nav
          aria-label="Мобильная навигация"
          className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 pb-4 text-sm text-[var(--color-muted)] md:hidden sm:px-8"
        >
          <NavLink to="/about" className="whitespace-nowrap hover:text-[var(--color-plum)]">
            О салоне
          </NavLink>
          <NavLink to="/services" className="whitespace-nowrap hover:text-[var(--color-plum)]">
            Каталог услуг
          </NavLink>
          <NavLink to="/booking" className="whitespace-nowrap hover:text-[var(--color-plum)]">
            Записаться
          </NavLink>
          <NavLink to="/masters" className="whitespace-nowrap hover:text-[var(--color-plum)]">
            Мастера
          </NavLink>
          <NavLink to="/profile" className="whitespace-nowrap hover:text-[var(--color-plum)]">
            Личный кабинет
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="whitespace-nowrap hover:text-[var(--color-plum)]">
              Админ-панель
            </NavLink>
          )}
          {isMaster && (
            <NavLink to="/master/bookings" className="whitespace-nowrap hover:text-[var(--color-plum)]">
              Кабинет мастера
            </NavLink>
          )}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-8 sm:py-14">
        {children}
      </main>

      <footer className="border-t border-[var(--color-sand)]/80 bg-[var(--color-plum-deep)] text-[var(--color-sand)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-7 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
             <span className="font-medium tracking-[0.12em] uppercase">Atelier beauté</span>
             <p className="mt-2 text-[var(--color-sand)]/75">© 2026 Atelier Beauté. Все права защищены.</p>
           </div>
          <div className="text-[var(--color-sand)]/75">
             <span>Красота в деталях</span>
             <span className="ml-4">Социальные сети: VK · Telegram</span>
           </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout