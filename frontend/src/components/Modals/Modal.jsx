import { useEffect } from 'react'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(48,32,49,0.55)] p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`my-auto w-full ${SIZES[size] || SIZES.md} rounded-2xl bg-[var(--color-white)] shadow-2xl ring-1 ring-[var(--color-sand)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-sand)]/70 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-plum-deep)]">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg px-2 py-1 text-xl leading-none text-[var(--color-muted)] transition hover:bg-[var(--color-ivory)] hover:text-[var(--color-plum)]"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--color-sand)]/70 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
