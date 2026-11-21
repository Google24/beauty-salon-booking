import Modal from './Modal'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message,
  confirmLabel = 'Удалить',
  busy = false,
  danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-[var(--color-sand)] px-4 py-2 text-sm font-medium text-[var(--color-plum)] transition hover:bg-[var(--color-ivory)] disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
              danger
                ? 'bg-[#8e3f4a] hover:bg-[#73323b]'
                : 'bg-[var(--color-plum)] hover:bg-[var(--color-plum-deep)]'
            }`}
          >
            {busy ? 'Выполнение...' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-[var(--color-ink)]">{message}</p>
    </Modal>
  )
}
