import { STATUS_LABELS } from '../utils/admin'

export const inputClass =
  'min-h-11 w-full rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-plum)] focus:ring-2 focus:ring-[var(--color-plum)]/10 disabled:cursor-not-allowed disabled:bg-[var(--color-ivory)] disabled:text-[var(--color-muted)]'

export const buttonPrimary =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-plum)] px-4 text-sm font-medium text-white transition hover:bg-[var(--color-plum-deep)] disabled:cursor-not-allowed disabled:opacity-50'

export const buttonSecondary =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--color-sand)] bg-[var(--color-white)] px-4 text-sm font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)] disabled:cursor-not-allowed disabled:opacity-50'

export const buttonDanger =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d6aeb3] bg-[#fff6f6] px-4 text-sm font-medium text-[#8e3f4a] transition hover:bg-[#f9e8e9] disabled:cursor-not-allowed disabled:opacity-50'

export function PageHeader({ title, description, eyebrow = 'Администрирование', actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-medium tracking-[0.18em] text-[var(--color-gold)] uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold text-[var(--color-plum-deep)] sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block text-sm font-medium text-[var(--color-plum)] ${className}`}>
      <span>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">{hint}</span>}
    </label>
  )
}

export function SelectField({ label, hint, options = [], placeholder, className = '', ...props }) {
  return (
    <Field label={label} hint={hint} className={className}>
      <select className={inputClass} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function CheckboxField({ label, description, ...props }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-sand)]/80 bg-[var(--color-ivory)]/50 px-4 py-3">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-[var(--color-sand)] accent-[var(--color-plum)]"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-[var(--color-plum)]">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{description}</span>
        )}
      </span>
    </label>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-[var(--color-ivory)] text-[var(--color-muted)] ring-[var(--color-sand)]',
    green: 'bg-[#eaf5ed] text-[#3f7659] ring-[#cce4d3]',
    red: 'bg-[#fbecee] text-[#8e3f4a] ring-[#f0d3d6]',
    gold: 'bg-[#faf3e4] text-[#8a6d34] ring-[#eddfc0]',
    plum: 'bg-[#f2eaf2] text-[var(--color-plum)] ring-[#e2d1e2]',
    blue: 'bg-[#e9f1f8] text-[#3c6588] ring-[#d2e3f0]',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tones[tone] || tones.neutral}`}
    >
      {children}
    </span>
  )
}

const STATUS_TONES = {
  new: 'gold',
  confirmed: 'blue',
  in_progress: 'plum',
  done: 'green',
  cancelled: 'red',
  no_show: 'red',
}

export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] || 'neutral'}>{STATUS_LABELS[status] || status}</Badge>
}

export function BoolBadge({ value, trueLabel = 'Да', falseLabel = 'Нет' }) {
  return <Badge tone={value ? 'green' : 'neutral'}>{value ? trueLabel : falseLabel}</Badge>
}

export function SearchBar({ value, onChange, placeholder = 'Поиск...', className = '' }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${inputClass} ${className}`}
    />
  )
}

export function FilterSelect({ label, value, onChange, options, placeholder = 'Все', className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium tracking-[0.06em] text-[var(--color-muted)] uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} min-h-10 py-2`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FilterPanel({ children }) {
  return (
    <div className="mt-6 grid gap-4 rounded-2xl bg-[var(--color-white)] p-5 shadow-[0_14px_35px_rgba(74,48,71,0.06)] ring-1 ring-[var(--color-sand)]/70 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}

export function TableSection({ children }) {
  return <div className="mt-6">{children}</div>
}

export function AccessDenied() {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-2xl bg-[var(--color-white)] p-10 text-center shadow ring-1 ring-[var(--color-sand)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbecee] text-2xl text-[#8e3f4a]">
        ⛔
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-[var(--color-plum-deep)]">
        Доступ запрещён
      </h2>
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        У вас недостаточно прав для просмотра этого раздела. Обратитесь к администратору.
      </p>
    </div>
  )
}

export function ErrorPanel({ message }) {
  if (message === 'Доступ запрещён') {
    return <AccessDenied />
  }

  return (
    <div className="mt-6 rounded-2xl bg-[#fbecee] px-5 py-4 text-sm text-[#8e3f4a] ring-1 ring-[#f0d3d6]">
      {message}
    </div>
  )
}

export function Avatar({ src, name, size = 'md' }) {
  const dimensions = size === 'sm' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Фото мастера'}
        className={`${dimensions} rounded-xl object-cover ring-1 ring-[var(--color-sand)]`}
      />
    )
  }

  return (
    <div
      className={`${dimensions} flex items-center justify-center rounded-xl bg-[var(--color-ivory)] font-semibold text-[var(--color-plum)] ring-1 ring-[var(--color-sand)]`}
    >
      {(name || '—').slice(0, 1).toUpperCase()}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--color-sand)]/70 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            active === tab.key
              ? 'bg-[var(--color-plum)] text-white'
              : 'text-[var(--color-muted)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-plum)]'
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-2 opacity-70">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}
