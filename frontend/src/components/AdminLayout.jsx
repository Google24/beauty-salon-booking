import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CommandPalette from './CommandPalette'
import { ADMIN_NAV_GROUPS as NAV_GROUPS } from '../utils/adminNav'

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-ivory)] text-[var(--color-ink)]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-sand)] bg-[var(--color-white)] lg:flex">
        <div className="border-b border-[var(--color-sand)] px-6 py-6">
          <NavLink to="/admin" className="block text-lg font-semibold tracking-[0.12em] text-[var(--color-plum)] uppercase">
            Atelier beauté
          </NavLink>
          <p className="mt-1 text-xs tracking-[0.14em] text-[var(--color-gold)] uppercase">
            Админ-панель
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('admin:open-palette'))}
          className="mx-3 mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-sand)] px-3 py-2.5 text-left text-xs text-[var(--color-muted)] transition hover:border-[var(--color-plum)] hover:text-[var(--color-plum)]"
        >
          <span className="text-base text-[var(--color-gold)]">⌕</span>
          <span className="flex-1">Быстрый переход</span>
          <kbd className="rounded border border-[var(--color-sand)] px-1.5 py-0.5 text-[10px]">
            Ctrl K
          </kbd>
        </button>

        <nav aria-label="Разделы админки" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.14em] text-[var(--color-muted)] uppercase">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive
                          ? 'bg-[var(--color-plum)] font-medium text-white'
                          : 'text-[var(--color-muted)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-plum)]'
                      }`
                    }
                  >
                    <span className="w-5 text-center text-base">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--color-sand)] px-5 py-5">
          <p className="truncate text-sm font-medium text-[var(--color-plum)]">
            {user?.first_name || user?.email || 'Администратор'}
          </p>
          <p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
          <div className="mt-4 flex gap-2">
            <NavLink
              to="/"
              className="flex-1 rounded-lg border border-[var(--color-sand)] px-3 py-2 text-center text-xs text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)]"
            >
              На сайт
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 rounded-lg border border-[var(--color-sand)] px-3 py-2 text-xs text-[#8e3f4a] transition hover:bg-[#fbecee]"
            >
              Выйти
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[var(--color-sand)] bg-[var(--color-white)] px-5 py-4 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <NavLink to="/" className="text-sm font-semibold text-[var(--color-plum)]">
                Atelier beauté
              </NavLink>
              <span className="text-xs text-[var(--color-muted)]">/ админка</span>
            </div>
            <p className="hidden text-xs tracking-[0.14em] text-[var(--color-muted)] uppercase lg:block">
              Панель управления салоном
            </p>
            <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('admin:open-palette'))}
                className="hidden items-center gap-2 rounded-lg border border-[var(--color-sand)] px-3 py-2 text-[var(--color-muted)] transition hover:border-[var(--color-plum)] hover:text-[var(--color-plum)] sm:flex"
              >
                <span className="text-sm">⌕</span>
                Поиск по разделам
                <kbd className="rounded border border-[var(--color-sand)] px-1.5 py-0.5 text-[10px]">
                  Ctrl K
                </kbd>
              </button>
              <span className="hidden sm:inline">{user?.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-[var(--color-sand)] px-3 py-2 text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)] lg:hidden"
              >
                Выйти
              </button>
            </div>
          </div>

          <nav
            aria-label="Разделы админки (мобильная версия)"
            className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 lg:hidden"
          >
            {NAV_GROUPS.flatMap((group) => group.items).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-2 text-xs transition ${
                    isActive
                      ? 'bg-[var(--color-plum)] text-white'
                      : 'bg-[var(--color-ivory)] text-[var(--color-muted)]'
                  }`
                }
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette />
    </div>
  )
}
