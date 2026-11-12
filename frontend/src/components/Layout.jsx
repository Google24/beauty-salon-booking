import { NavLink } from 'react-router-dom'

function Layout({ children }) {
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
              to="/services"
              className="transition-colors hover:text-[var(--color-plum)]"
            >
              Каталог услуг
            </NavLink>
            <a
              href="/bookings"
              className="transition-colors hover:text-[var(--color-plum)]"
            >
              Мои записи
            </a>
          </nav>

          <a
            href="/login"
            className="rounded-full border border-[var(--color-plum)] px-4 py-2 text-sm font-medium text-[var(--color-plum)] transition-colors hover:bg-[var(--color-plum)] hover:text-[var(--color-white)]"
          >
            Войти
          </a>
        </div>

        <nav
          aria-label="Мобильная навигация"
          className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 pb-4 text-sm text-[var(--color-muted)] md:hidden sm:px-8"
        >
          <NavLink to="/services" className="whitespace-nowrap hover:text-[var(--color-plum)]">
            Каталог услуг
          </NavLink>
          <a href="/bookings" className="whitespace-nowrap hover:text-[var(--color-plum)]">
            Мои записи
          </a>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-10 sm:px-8 sm:py-14">
        {children}
      </main>

      <footer className="border-t border-[var(--color-sand)]/80 bg-[var(--color-plum-deep)] text-[var(--color-sand)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-7 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-medium tracking-[0.12em] uppercase">Atelier beauté</span>
          <span className="text-[var(--color-sand)]/75">Красота в деталях</span>
        </div>
      </footer>
    </div>
  )
}

export default Layout