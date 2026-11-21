import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_NAV_ITEMS } from '../utils/adminNav'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const openPalette = useCallback(() => {
    setQuery('')
    setActiveIndex(0)
    setOpen(true)
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()

        if (open) {
          setOpen(false)
        } else {
          openPalette()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('admin:open-palette', openPalette)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('admin:open-palette', openPalette)
    }
  }, [open, openPalette])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) return ADMIN_NAV_ITEMS

    return ADMIN_NAV_ITEMS.filter((item) =>
      `${item.label} ${item.keywords} ${item.group}`.toLowerCase().includes(normalized),
    )
  }, [query])

  function handleQueryChange(event) {
    setQuery(event.target.value)
    setActiveIndex(0)
  }

  function goTo(item) {
    if (!item) return

    navigate(item.to)
    setOpen(false)
  }

  function handleInputKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) =>
        results.length ? (index - 1 + results.length) % results.length : 0,
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      goTo(results[activeIndex])
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-[rgba(48,32,49,0.5)] p-4 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Быстрый переход по админке"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-[var(--color-white)] shadow-2xl ring-1 ring-[var(--color-sand)]"
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-sand)] px-5 py-4">
          <span className="text-lg text-[var(--color-gold)]">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Перейти к разделу... (например, «записи»)"
            className="w-full bg-transparent text-base text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]/70"
          />
          <kbd className="rounded-md border border-[var(--color-sand)] px-2 py-1 text-[10px] text-[var(--color-muted)]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
              Ничего не нашлось
            </p>
          )}

          {results.map((item, index) => (
            <button
              key={item.to}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => goTo(item)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                index === activeIndex
                  ? 'bg-[var(--color-plum)] text-white'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-ivory)]'
              }`}
            >
              <span className="w-6 text-center text-base">{item.icon}</span>
              <span className="flex-1 font-medium">{item.label}</span>
              <span
                className={`text-[10px] tracking-[0.08em] uppercase ${
                  index === activeIndex ? 'text-white/70' : 'text-[var(--color-muted)]'
                }`}
              >
                {item.group}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--color-sand)] px-5 py-3 text-[10px] text-[var(--color-muted)]">
          <span>↑ ↓ — выбор</span>
          <span>Enter — открыть</span>
          <span className="ml-auto">Ctrl/⌘ + K — открыть панель</span>
        </div>
      </div>
    </div>
  )
}
